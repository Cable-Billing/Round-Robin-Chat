const electron = require('electron');
const url = require('url');
const path = require('path');

const {app , BrowserWindow, Menu, remote, ipcMain} = electron;

let mainWindow;

app.on('ready', function() {
    // Create a new Electron window
    mainWindow = new BrowserWindow({
        title: 'Round Robin Chat'
    });

    // Load HTML into the Electron window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.focus();
});
