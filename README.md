# Cycle Planner
https://cycle-planner.herokuapp.com

####Trip Planner
A user can click on a station on the map to bring up the station's status - number of bikes available, number of docks available. They can set it to the beginning dock and choose another dock as the end dock. The system will predict how feasible it will be to both get a bike and dock that bike within the next hour at the selected stations.

####Time-Map
A user can view the saturation of bikes at stations every quarter-hour and make future plans based on the bikes.

####Technologies
MongoDB Database  
Node.js Server-Side Environment  
Express.js Server  
CitiBike API - https://www.citibikenyc.com/stations/json  
Google Maps API  
Google Maps API Services  
Front-End HTML, CSS, JS, JQuery  
SemanticUI Library

####Using Cycle Planner
- Markers denote CitiBike station locations, marker opacity denotes number of bikes available at a station at a given time
- On page load, given time is current and is reflected in the time drop-down menu
- Clicking a marker brings up basic information about the station - Name and Number of Bikes - as well as two buttons to set the station as either the starting dock or the destination for your trip
- Clicking the buttons will populate information on the side menu for the corresponding station
- If there is both a starting station and a destination, trip info will populate with trip distance and duration via bicycle
- Additionally, a recommendation will appear on how easy it will be to find a bike at the starting station and to dock at the destination
- The time drop-down, as well as the play button will change the given time and repopulate the map and all tables with information corresponding to that time
- The play button will rapidly loop through all times for a visualization of bike movements, and the pause button will stop the loop
- The help button brings up the same information described above


####Wireframe
![Wireframe](http://i.imgur.com/66aWMW2.png "Single Page Citibike App")

####Historical Data Structure
![ERD](http://i.imgur.com/f1A059V.png "ERD")
