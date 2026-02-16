# ⏱️ Timesheet Tracker

A simple, mobile-friendly web application for tracking work hours with automatic calculations and multiple export formats.

## Features

- ✅ **Simple Input**: Just enter date, start time, and end time
- 🔢 **Automatic Calculation**: Hours calculated in decimal format (e.g., 3.5h instead of 3h 30m)
- 📅 **Pay Period Management**: Automatically groups entries by pay period (21st to 20th)
- 📱 **Mobile-First Design**: Works great on phones and tablets
- 💾 **Local Storage**: All data stored in your browser (no server needed)
- 📤 **Multiple Export Formats**:
  - Text format (compatible with Google Keep notes)
  - Excel/CSV format (ready to copy to your timesheet)
  - JSON format (for backup and data portability)
- 📥 **Import/Export**: Backup and restore your data
- 🗑️ **Data Management**: Clear all data when needed

## How to Use

### Live Demo
Visit: **[https://timesheettracker.up.railway.app](https://timesheettracker.up.railway.app)**

### Run Locally
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start tracking your hours!

## Usage Guide

1. **Add Entry**: Select date, enter start and end times, click "Add Entry"
2. **View Entries**: See all entries organized by pay period
3. **Export Data**: 
   - **Text**: Copy-paste format for notes
   - **Excel**: CSV file ready to import
   - **JSON**: Backup your data
4. **Import Data**: Restore from JSON backup
5. **Clear Data**: Remove all entries (use carefully!)

## Pay Period Logic

The app automatically groups entries by pay periods running from the **21st of one month to the 20th of the next month**. This matches typical Danish employment payment cycles.

## Data Privacy

All data is stored **locally in your browser** using localStorage. No data is sent to any server. Your timesheet information stays completely private.

## Technical Details

- Pure HTML, CSS, and JavaScript (no frameworks)
- No build process required
- Works offline after first load
- Compatible with all modern browsers
- Responsive design (mobile, tablet, desktop)

## Browser Compatibility

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

## Tips

- **Backup regularly**: Export to JSON to save your data
- **Use on multiple devices**: Export from one device, import on another
- **Excel format**: Open the CSV file in Excel or Google Sheets
- **Text format**: Perfect for copying to Google Keep or other note apps

## License

MIT License - Feel free to use and modify as needed.

## Author

David Zsolt Galfi
