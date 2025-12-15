const User = require("../models/user");
const { userauth } = require("../middlewares/auth");
const { validateeditprofiledata } = require("../utils/validation")
const express = require("express");
const profilerouter = express.Router();
const post = require("../models/post")
const cloudinary = require("../middlewares/uploads");
const Postlikecomment = require("../models/comment")
const Postlike = require("../models/like")
const mongoose = require("mongoose");
const { uploads } = require("../middlewares/multer.js");
const { uploadCloudinary } = require("../middlewares/cloudinary.js");
const { formatLinkedInTime, getMonth } = require("../utils/formatedDate.js");
const educationSchema = require('../models/education.js');
const experienceSchema = require('../models/experience.js')
const streamifier=require("streamifier");
const multer=require("multer")


profilerouter.get("/profile/view", userauth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  }
  catch (error) {
    res.status(400).send("error" + error.message);
  }


});


// profilerouter.patch("/profile/edit",userauth,async(req,res)=>{
//     try {
//         if(!validateeditprofiledata(req))
//         {
//             throw new Error("invalid edit request");
//         }
//         const loggedinuser=req.user;

//         Object.keys(req.body).forEach((key)=>(loggedinuser[key]=req.body[key]));

//         await loggedinuser.save();

//         res.json({message:`${loggedinuser.firstname}, your profile updated successfull`,
//             data:loggedinuser
//         });

//     } catch (error) {
//         res.status(400).send("error "+error.message);
//     }
// })

const storage = multer.memoryStorage();
const uploadProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

profilerouter.patch(
  "/profile/edit",
  userauth,
  uploadProfile.single("photo"), // photo from frontend FormData
  async (req, res) => {
    try {
      const loggedinuser = req.user;

      // Update text fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          loggedinuser[key] = req.body[key];
        }
      });

      // Upload photo to Cloudinary if provided
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          try
          {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profile_photos",resource_type:"image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        }
        catch(error)
        {
          reject(error);
        }
      });

        loggedinuser.photourl = result.secure_url;
      }

      await loggedinuser.save();

      res.json({
        message: `${loggedinuser.firstname}, your profile was updated successfully.`,
        data: loggedinuser,
      });
    } catch (error) {
      console.error("PROFILE EDIT ERROR:", error);
      res.status(500).json({
        message: "Profile update failed",
        error: error.message,
        stack: error.stack,
      });
    }
  }
);



profilerouter.post("/search", userauth, async (req, res) => {
  try {
    const { firstname } = req.body;

    // Use a more specific query if you have it, e.g., case-insensitive
    const users = await User.find({ firstname: firstname });

    // Correctly check if the returned array is empty
    if (users.length === 0) {
      // Send a 404 response or just an empty array
      return res.status(404).json({ message: "No users found with that first name." });
    }

    // The 'users' variable is already an array, so you can just send it
    // and the frontend will correctly handle it.
    res.json(users);

  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "An error occurred on the server.", error: error.message });
  }
});

profilerouter.post("/post", userauth, async (req, res) => {
  try {
    const { url, description } = req.body;

    // Only validate if url is provided and it's supposed to be an HTTP URL
    if (url && url.length > 0 && !url.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL",
      });
    }

    if (!url && !description) {
      return res.status(400).json({
        success: false,
        message: "Cannot create an empty post",
      });
    }

    const newpost = await post.create({
      url: url || "",          // optional
      description: description || "", // optional
      author: req.user._id,
      name: req.user.firstname,
      photourl: req.user.photourl
    });

    res.status(200).json(newpost);
  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});




profilerouter.get("/post/feed", userauth, async (req, res) => {
  try {
    const posts = await post.find({ status: "posttoall" })
      .populate(
        "author",
        "firstname photourl"
      )
      .sort({ createdAt: -1 })
      .lean();
    const result = posts.map((item) => {
      return {
        ...item, createdAt: formatLinkedInTime(item.createdAt)
      }
    })
    // console.log("posts: ", result);
    res.status(200).json(result);
  }
  catch (error) {
    console.log(error);

  }
});

// profilerouter.get("/post/user",userauth,async(req,res)=>{
//     try{
//         const loggedinuser=req.user;
//         const userpost=await post.find({status:"posttoall",
//             loggedinuser
//         })
//         console.log(userpost);

//         res.status(200).json({
//             message:"post of "+loggedinuser.firstname,
//             data:userpost.data
//         });
//     }
//     catch(error)
//     {
//         console.log(error);

//     }
// })
profilerouter.get("/post/user", userauth, async (req, res) => {
  try {
    const loggedinuser = req.user;

    // Correct query: Find posts where the 'user' field matches the logged-in user's ID
    const userpost = await post.find({
      author: loggedinuser._id
    }).sort({ createdAt: -1 }).lean();

    const result = userpost.map((item) => {
      return {
        ...item, createdAt: formatLinkedInTime(item.createdAt)
      }
    })

    // Check if the query returned any posts
    if (userpost.length > 0) {
      return res.status(200).json({
        message: "Posts of " + loggedinuser.firstname,
        data: result // Correct: send the entire array of posts
      });
    } else {
      // Handle case where no posts are found
      return res.status(200).json({
        message: "No posts found for this user.",
        data: []
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

profilerouter.get("/post/:postId", userauth, async (req, res) => {
  try {
    const { postId } = req.params;
    // console.log(req.params);
    // console.log(postId);

    const userPost = await post.findById(postId).populate(
      "author",
      "firstname photourl"
    ).lean(); // clean plain object format
    // console.log("post:", userPost);
    const result = {
      ...userPost, createdAt: formatLinkedInTime(userPost.createdAt)
    }
    if (!userPost) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});




// profilerouter.patch("/post/:postId/like", userauth, async (req, res) => {
//   try {
//     const postId = req.params.postId;
//     const loggedinuser = req.user;
//     const like = await post.findByIdAndUpdate(
//       postId,
//       { $inc: { like: 1 }, },
//       { new: true }
//     );
//     res.status(200).json({
//       data: like
//     })
//   }
//   catch (error) {
//     console.log(error);

//   }
// })
// profilerouter.patch("/post/:postId/comment", userauth, async (req, res) => {
//   try {
//     const postId = req.params.postId;
//     const loggedinuser = req.user
//     const { comment } = req.body;
//     const text = await post.findByIdAndUpdate(
//       postId,
//       {
//         $push: {
//           comment: {
//             user: loggedinuser,
//             text: comment
//           }
//         }
//       },
//       { new: true }
//     );
//     res.status(200).json({
//       data: text
//     })
//   }
//   catch (error) {
//     console.log(error);

//   }
// })
profilerouter.post("/comment/:postId", userauth, async (req, res) => {
  try {
    const PostData = await post.findById(req.params.postId);
    if (!PostData) return res.status(404).json({ error: "Post not found" });

    const comment = new Postlikecomment({
      post: PostData._id,  // ✅ must match schema field
      user: req.user._id,
      text: req.body.text,
    });

    await comment.save();

    // Populate the user info before sending response
    await comment.populate("user", "firstname photourl");

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ---------------------------
// Get all comments for a post
// ---------------------------
profilerouter.get("/comment/:postId", userauth, async (req, res) => {
  try {
    const comments = await Postlikecomment.find({ post: req.params.postId }).populate(
      "user",
      "firstname photourl"
    ).lean();
    const result = comments.map((item) => {
      return { ...item, createdAt: formatLinkedInTime(item.createdAt) }
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// LIKE a post
// ---------------------------
profilerouter.post("/like/:postId", userauth, async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    let likeDoc = await Postlike.findOne({ post: postId });

    // If no like document exists, create one
    if (!likeDoc) {
      likeDoc = new Postlike({
        post: postId,
        likedBy: [userId],
        likeCount: 1
      });
      await likeDoc.save();
      return res.json({
        message: "Liked",
        likeCount: likeDoc.likeCount,
        likedBy: likeDoc.likedBy
      });
    }

    // If user already liked → unlike
    if (likeDoc.likedBy.includes(userId)) {
      likeDoc.likedBy.pull(userId);
      likeDoc.likeCount = likeDoc.likedBy.length;
      await likeDoc.save();

      return res.json({
        message: "Unliked",
        likeCount: likeDoc.likeCount,
        likedBy: likeDoc.likedBy
      });
    }

    // Else → like
    likeDoc.likedBy.push(userId);
    likeDoc.likeCount = likeDoc.likedBy.length;
    await likeDoc.save();

    res.json({
      message: "Liked",
      likeCount: likeDoc.likeCount,
      likedBy: likeDoc.likedBy
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

profilerouter.get("/like/:postId", userauth, async (req, res) => {
  try {
    const postId = req.params.postId;

    const likeDoc = await Postlike.findOne({ post: postId })
      .populate("likedBy", "firstname photourl");

    if (!likeDoc) {
      return res.json({
        likeCount: 0,
        likedBy: []
      });
    }

    res.json({
      likeCount: likeDoc.likeCount,
      likedBy: likeDoc.likedBy
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


profilerouter.post("/upload", (req, res) => {
  uploads.single("image")(req, res, async (err) => {
    try {
      // 🔴 HANDLE MULTER ERRORS
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided",
        });
      }

      // ✅ Upload to Cloudinary
      const result = await uploadCloudinary(req.file.buffer);

      return res.status(200).json({
        success: true,
        url: result.secure_url, // ✅ USE THIS EVERYWHERE
        public_id: result.public_id,
      });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
});


// profilerouter.get("/user/:username",userauth,async(req,res)=>{
//   const {username}=req.params;
//   try
//   {
//   const userclick=await User.findOne({firstname: username})
//   // .populate("firstname lastname photourl about age gender");
//   res.json(userclick)
//   }
//   catch(error)
//   {
//     console.log(error);

//   }
// })

profilerouter.get("/userview/:targetuserid", userauth, async (req, res) => {
  // console.log("route params:", req.params);
  // console.log("targetuserid:", req.params.targetuserid);

  const { targetuserid } = req.params;
  const loggedinuser = req.user?._id;
  // console.log("loggedinuser:", loggedinuser);
  // console.log("targetuserid:", targetuserid);

  try {
    const user = await User.findById(targetuserid).populate("viewedBy", "firstname lastname");
    const loggedInUser = await User.findById(loggedinuser);
    // if (user.viewedBy.includes(loggedinuser)) {
    //   return res.json({ view: user.userViewCount, message: "Already viewed" });
    // }
    const userViewedObj = {};
    for (const userViewed of user.viewedBy) {
      userViewedObj[userViewed._id] = userViewed.firstname
    }
    userViewedObj[loggedinuser] = loggedInUser.firstname;
    user.viewedBy = (Object.keys(userViewedObj));

    user.userViewCount = Object.keys(userViewedObj).length;
    await user.save();
    res.status(200).json({ message: "user viewed successfully." })
  }
  catch (error) {
    console.log(error);
  }

})

profilerouter.get("/userpostview/:targetpostid", userauth, async (req, res) => {
  // console.log("route params:", req.params);
  // console.log("targetpostid:", req.params.targetpostid);
  const { targetpostid } = req.params;
  const loggedinuser = req.user?._id;

  // console.log("loggedinuser:", loggedinuser);
  // console.log("targetpostid:", targetpostid);

  try {
    const userpost = await post.findById(targetpostid);
    if (userpost.viewedBy.includes(loggedinuser)) {
      return res.json({ view: userpost.userPostViewCount, message: "Already post Viewed" })
    }
    userpost.viewedBy.push(loggedinuser);
    userpost.userPostViewCount += 1;
    await userpost.save();
  }
  catch (error) {
    console.log(error);
  }
})

profilerouter.post("/education", userauth, async (req, res) => {
  try {
    const loggedinuser = req.user?._id;
    const education = req.body;
    if (!education) {
      return res.status(400).json({ message: "education data missing" });
    }
    const school = education.school.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const degree = education.degree.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const field_of_study = education.field_of_study.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    //month-year
    // const fromDate = education.from.split(" ")[0].charAt(0).toUpperCase() + education.from.slice(1);
    // const toDate = education.to.split(" ")[0].charAt(0).toUpperCase() + education.to.slice(1);
    const educationData = { ...education, school, degree, field_of_study };
    educationData["user_id"] = loggedinuser;
    const newEducation = new educationSchema(educationData)
    await newEducation.save();
    res.status(200).json({ message: "education added successfully", data: newEducation });
  }
  catch (error) {
    console.log(error);
  }
});

profilerouter.post("/experience", userauth, async (req, res) => {
  try {
    const loggedinuser = req.user?._id;
    // const experience = {...req.body, user_id: loggedinuser};
    const experience = req.body;
    if (!experience) {
      return res.status(400).json({ message: "Experience data missing" });
    }
    const title = experience.title.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const company = experience.company.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const description = experience.description.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const experienceData = { ...experience, title: title, company: company, description: description };
    experienceData["user_id"] = loggedinuser;
    const newExperience = new experienceSchema(experienceData);
    await newExperience.save();
    res.status(200).json({ message: "experience added successfully." })
  } catch (error) {
    console.log("error in experience: ", error);
    res.status(500).json({ message: error.message || "internal server error." })
  }
});

profilerouter.get('/education', userauth, async (req, res) => {
  try {
    const loggedinuser = req.user?._id;
    const response = await educationSchema.find({ user_id: loggedinuser }).sort({ createdAt: -1 });
    for (const edu of response) {
      edu.from = getMonth(+(edu.from.split('-')[1])) + '-' + edu.from.split('-')[0];
      edu.to = getMonth(+(edu.to.split('-')[1])) + '-' + edu.to.split('-')[0];
    }
    return res.status(200).json(response);
  } catch (error) {
    console.log("error in education: ", error);
    res.status(500).json({ message: error.message || "internal server error." })
  }
});

profilerouter.get('/experience', userauth, async (req, res) => {
  try {
    const loggedinuser = req.user?._id;

    const experiences = await experienceSchema
      .find({ user_id: loggedinuser })
      .sort({ from: 1 })
      .lean();

    for (const experience of experiences) {
      experience.from = getMonth(+(experience.from.split('-')[1])) + '-' + experience.from.split('-')[0];
      if (experience.to !== 'Present') {
        experience.to = getMonth(+(experience.to.split('-')[1])) + '-' + experience.to.split('-')[0];
      }
    }
    // Group by company like LinkedIn
    const grouped = experiences.reduce((acc, exp) => {
      if (!acc[exp.company]) acc[exp.company] = [];
      acc[exp.company].push(exp);
      return acc;
    }, {});

    // Sort each company's experiences by createdAt descending
    Object.keys(grouped).forEach(company => {
      grouped[company].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    // Sort companies themselves by latest experience createdAt
    const sortedCompanies = Object.entries(grouped)
      .sort((a, b) => new Date(b[1][0].createdAt) - new Date(a[1][0].createdAt))
      .reduce((acc, [company, exps]) => {
        acc[company] = exps;
        return acc;
      }, {});
    // const fromDate = education.from.split(" ")[0].charAt(0).toUpperCase() + education.from.slice(1);
    // const toDate = education.to.split(" ")[0].charAt(0).toUpperCase() + education.to.slice(1);
    console.log("grouped: ", sortedCompanies);
    res.status(200).json(sortedCompanies);

  } catch (error) {
    console.log("error in experience: ", error);
    res.status(500).json({ message: "internal server error" });
  }
});


profilerouter.patch("/experience/:experienceid", userauth, async (req, res) => {
  try {
    const { experienceid } = req.params;
    const updatedExperience = await experienceSchema.findByIdAndUpdate(experienceid, req.body, { new: true }).lean();
    res.status(200).json({ message: "experience added successfully.", updatedExperience })
  } catch (error) {
    console.log("error in experience: ", error);
    res.status(500).json({ message: error.message || "internal server error." })
  }
});

profilerouter.patch("/education/:educationid", userauth, async (req, res) => {
  try {
    const { educationid } = req.params;
    const updatedEducation = await educationSchema.findByIdAndUpdate(educationid, req.body, { new: true }).lean();
    res.status(200).json({ message: "education added successfully.", updatedEducation })
  } catch (error) {
    console.log("error in experience: ", error);
    res.status(500).json({ message: error.message || "internal server error." })
  }
});

profilerouter.get("/education/:userId", userauth, async (req, res) => {
  try {
    const { userId } = req.params;
    const edu = await educationSchema.find({ user_id: userId })
    res.json(edu);
  }
  catch (error) {
    console.log(error);

  }
})

profilerouter.get("/experience/:userId", userauth, async (req, res) => {
  try {
    const { userId } = req.params;
    const experience = await experienceSchema.find({ user_id: userId })
    res.json(experience);
  }
  catch (error) {
    console.log(error);

  }
})


module.exports = profilerouter;
