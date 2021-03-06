# 0.7.0:
- Added a filter bar to the viewer page that filters the measure group to files that include the filter string
- Added "Reimport Files" to folder settings. Any images and RSML in the chosen folder will be reimported back to the folder from which reimport was selected
- Added 'Export Failed' to folder settings. Any images marked as failed can be exported to a selected directory and removed from RootNav Portal
- Added right clicking a thumbnail to be able to "mark as failed", and thus exclude the image from exporting traits
- Added button and styling to Viewer to toggle failed, and colouring the name red if it is failed
- Added a shrinkable top bar with a hamburger
- Added a number that shows how many files are left after filtering on the viewer page
- RSML without an image can now be correctly displayed on the viewer
- Added new 'absolute average' measurements for angles
- RSML now correctly renders in thumbnails if there is no accompanying source image
- Folders will now be matched by the filter bar, and display all images if the folder path includes the query string
- Viewer will skip any files not matched by the filter query
- "Open Image: X of Y" respects the filter query, and will display red if no files are matched
- Fixed a bug causing filenames with `.`s in them to not be read properly in the backend
- Any failed API responses mark that image as failed
- Images marked as failed either by user or by API error will not be re-queued for the API
- Checking a node in the add button folder picker now checks and expands all children
- Selecting a model in the add button folder picker now propagates that model to all checked children
- Thumbnail sizing is now based on the size of the Bootstrap grid
- Increased folder depth to 8 in case it caused a problem

# 0.6.0:
- Added auto-updating. App will download, notify, and update on close
- Moved thumbnail generation to upon opening a folder to reduce potentially unnecessary loading/storing of folders that may not be opened.
- Added an 'About' page to document maintainer contacts, suggestion/bug link, version and internals
- Added 'Open Viewer' button to gallery, and added state to viewer if nothing is open
- Added type checking for plugins
- Modified message dialog when closing the gallery while images are still processing
- Added separator to icon menu
- Re-added missing util function `splitLinesAsPlants`
- Added tooltip to explain why images are being skipped in viewer page
- Fixed potential crash when importing non .js plugins
- Fixed a bug which caused newly imported folders to not update in the viewer page until another action was made
- Fixed a bug causing thumbnails to not refresh after background app
- Fixed a bug causing the export "Open" button being unable to find a written file when exporting multiple
- Fixed a crash when navigating the viewer into an RSML without an image
- Fixed mutliple crashes and exceptions relating to refreshing the gallery page
- Fixed crash where deleting an image from the file system and then refreshing would crash viewer if that image was currently open
- Fixed bug when switching folders in the viewer can crash if the first tag has no image or RSML

# 0.5.0

- Changed RSML parsing to no longer rely on keys being present in the RSML tags, supporting older RSML
- Moved scanning folder structures for importing to the backend, and made import button reflect it being busy
- Added small blacklist of folders to never scan - such as operating system folders and development library folders
- Fixed thumbnails re-rendering when the queue/inflight files changed
- Implemented angle measure plugins
- Added desktop notification for when all queued files are returned from API, can be clicked to reopen the gallery
- Fixed a bug where thumbnails wouldn't be generated upon opening gallery after backgrounding
- Fixed a bug where the RSML results would be sent along with thumbnail HTTP request
- Moved operations from FolderView's render to componentDidMount now we know how React works
- Increased API concurrency to 10 files
- Updated Electron to 8.2.2

# 0.4.0

- Gave thumbnails a minimum set of dimensions for use before the thumbnails have been received
- Added an "Open" button to the measurement export modal to open the containing folder of the where the CSV was saved to
- Added a loading spinner to the folder cards if they are waiting for thumbnails to come back

# 0.3.0

- Replaced IPC and Redux syncing as method of parsing RSML and thumbnails with a local-only HTTP server in the backend, hugely improving performance
- Thumbnails opt for lazy loading where possible, only loading first time when they are scrolled onto the screen
- Thumbnails and RSML process in batches by the folder, rather than individual files
- Added automatic network detection - loss of connectivity will be gracefully handled and alerted to, as will reconnection. This will fail if local LAN adapters exist in the system such as VirtualBox's loopback adapter
- Added plugin descriptions in the form of black 'i' icons on the plugin tiles
- Thumbnail sizes are more consistent and scale properly in the gallery now
- Added wiki documentation for plugin development
- Updated default model text
