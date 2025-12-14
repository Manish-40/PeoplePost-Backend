devtinder api

authrouter
post /signup
post /login
post /logout

profilerouter
get /profile/view
patch /profile/edit
patch /profile/password

connection request router
post /request/send/interested/:userid
post /request/send/ignored/:userid
post /request/review/accepted/:requestid
post /request/review/rejected/:requestid

userrouter
get /user/connections
get /user/requests
get /user/feed -gets you the profiles of other users on platform

status : ignored, iterested, accepted, rejected