# Simple Sheets Scheduler
Using a google sheet and App Script quickly distribute shifts to team members based on availablity

### Setup
1. In your Google Spreadsheet go to the **Extentions >> App Script**
2. Replace the template code with the code provided [here](scheduler.gs)
3. Save the file with **ctl + s** or **cmd + s**
4. Return to the Google Spreadsheets tab and refresh

### Functions
In the sheet with the team availability go to the top tool bar and select **Scheduling >> Make Schedule** to generate a new sheet with assign shifts
 - Make sure the schedule table follows the format DATE, DAY, TIME, team member 1, ..., team member n
 - Make sure availability is marked with <span style="color: #00ff00;">#00ff00 green

In the sheet with the team availability go to the top tool bar and select **Scheduling >> Export Schedule** to generate a new sheet with assign shifts
and then export it as a csv to your root dir in Google Drive  
