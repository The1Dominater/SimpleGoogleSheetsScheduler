# Simple Sheets Scheduler
Using a google sheet and App Script quickly distribute shifts to team members based on availablity of each team member.
Assumes:
 - 1 employee per shift
 - Employee's all are willing to work equal number of shifts

### Setup
1. In your Google Spreadsheet go to the **Extentions >> App Script**
2. Replace the template code with the code provided [here](scheduler.gs)
3. Save the file with **ctl + s** or **cmd + s**
4. Return to the Google Spreadsheets tab and refresh

### Functions
1. generateTemplate()
In a blank sheet go to the top tool bar and select **Scheduling >> Make availablity template** to generate a template table for setting employee availablity
and then have employees fill in available times with green and non available time withs red

2. assignShifts()
In the sheet containing the team's Availability Table go to the tool bar and select **Scheduling >> Make Schedule** to generate a new sheet with assigned shifts
   - Make sure the schedule table follows the format DATE, DAY, TIME, team member 1, ..., team member n
   - Make sure availability is marked with #00ff00 green, all other colors will be considered unavailable


