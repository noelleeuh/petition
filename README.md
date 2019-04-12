# Petition

### Summary
The idea behind this project is to create an online petition that visitors can sign to make their voice heard on a particular issue.

### Tech used
  - Javascript
  - Handlebars
  - PostgreSQL databases
  - Express.js
  - Node.js
  - HTML
  - CSS
 
### Features
  - Registration form
  - Login form
  - Logout option
  - Add/Edit profile
  - Submit/erase signature
  - See users who've signed the petition (and filter them by city)

### Set-up
This repo contains a package.json that lists all of the dependencies the project is expected to require. To install them, cd into the directory and type the following.

    $npm install

### Try it before you buy it
http://stopthismadness.herokuapp.com

![](register_demo.gif)

### TODOs
1. Fix bugs:
    - Error when I try to register with an already registered email
    - Error when I try to login with an incorrect password
    - I can upload an empty signature without drawing anything on the canvas

2. Improve:
    - Quality of signature

3. Add new features:
    - Make restriction to accept real email accounts
    - Add deregistration option
