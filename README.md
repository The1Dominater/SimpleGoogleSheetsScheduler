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
In a blank sheet go to the top tool bar and select **Scheduling >> Make availablity template** to generate a template table for setting employee availablity and then have employees fill in their available times with green and unavailable times with red

2. assignShifts()
In the sheet containing the team's Availability Table go to the tool bar and select **Scheduling >> Make Schedule** to generate a new sheet with assigned shifts
   - Make sure the schedule table follows the format DATE, DAY, TIME, team member 1, ..., team member n
   - Make sure availability is marked with #00ff00 green, all other colors will be considered unavailable

# Advanced Sheets Scheduler
Using a google sheet and App Script "quickly" distribute shifts to team members based on:
 - Availablity of each staff member
 - Each staff members desired number of shifts
 - Number of staff needed for a given shift
Assumes:
 - All shifts occur in equal intervals(you can change intervals to 1 if you need)

### Setup
1. In your Google Spreadsheet go to the **Extentions >> App Script**
2. Insert the files [here](/AdvancedScheduler) into the App Script **Files**
3. Save the file with **ctl + s** or **cmd + s**
4. Return to the Google Spreadsheets tab and refresh

### Functions
1. "Make schedule template" >> generateTemplate()
In a blank sheet go to the top tool bar and select **Scheduling >> Make schedule template** to generate a template table for setting employee availablity and then have employees fill in their available times with green and unavailable times with red

Here is a preview of the generated example template:
[image](/previews/generatedTemplatePreview.png)

3. "Assign shifts" >> generateShiftAssignments()
In the sheet containing the team's availabilty go to the tool bar and select **Scheduling >> Assign shifts** to generate a new sheet with assigned shifts
   - Make sure the schedule table follows the format of the generated template
   - Make sure availability is marked with green, all other colors will be considered unavailable
The resulting schedule labeled "Schedule For \<sheet name\>" with list staff members horizontally across the top and shifts vertically along the side. Staff members can view their assigned shifts by going to their respective columns and noting the cells filled in with green. The row the green cell is in marks a shift they have been assigned. Rows highlighted in yellow indicated not enough employee's were available to fill in the shift and further examination is required. The auto scheduling algorithm uses a greedy approach, therefore the schedule may NOT be optimal and a better verision which less empty shifts may be available.
Here is a preview of the results of running generateShiftAssignments:
[image](/previews/assignShiftsPreview.png)


