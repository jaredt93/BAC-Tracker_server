# Project 9: ITIS 5280 - BAC Tracker
## UNC Charlotte | Advanced Mobile Application Development
### Members:
- Alex Miller
- Tom Va
- Jared Tamulynas

### Link to Youtube Channel
[Project Demo](https://youtu.be/fFmsVcjifYk)

### Implementation
In this in class assignment you will be working with the BACtrack BLE based alcohol breathalyzer.  Each team will be provided by a breathalyzer to use for this project.

- You are not allowed to use frameworks such as Firebase. 
- You should use NodeJS and Express framework to create this app.
- You should use an online provisioning provider, such as Heroku, Amazon AWS, or Microsoft Azure, or others.
- Your api should provide sign in, login, and logout features. (Use JWT tokens!!)
    
### Mobile App
- Integrate the SDK provided by BACtrack in order to allow connectivity with your mobile application.
- Your mobile app should allow only a logged in user to connect their BACtrack device though the BLE connection using the provided SDK.
- The app should provide a usable interface in order to guide the user through the breathalyzer reading process.
- The received breathalyzer readings should be stored for the currently logged in user on your server using apis provided by your server.
- The user should be able to review the previously measured BACtrack measurements, and also you should use a graphing library to display these measurements using charts (line chart). Feel free to use any library to accomplish this task.
     
### Server App
- Your server should provide secure APIs to the mobile app, and use JWT tokens to manage user authentication.
- The users should be allowed to login and register using email and password.
