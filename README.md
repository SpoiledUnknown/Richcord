# Richcord

> NOTE:
> This project is going through a major rewrite.
>
> Custom IPC Core will be implemented.
>
> new CLI system will be implemented.
>
> new UI will be implemented.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
[![Docs Passing](https://img.shields.io/badge/Docs-Passing-brightgreen.svg)](https://github.com/SpoiledUnknown/Richcord-Presence/blob/main/README.md)

<p align="center">
    <img src="public/Richcord.png" alt="Richord Presence" width="100px">
</p>

## Table Of Content:

1. [Description](#description)
2. [Installation](#installation)
   1. [Method 1](#method-1)
   2. [Method 2](#method-2)
3. [Setting up the dev environment](#how-to-setup-dev-environment)
4. [Creating custom client](#custom-client-setup)
5. [How to use](#how-to-use)

## Description:

An advance discord rich presence software that allows a lot of customisation and control in hand of user without over
complicating things.

## Installation:

**Note:** _Method 2 requires the NodeJS installed in pc if not avaibale install
from [here](https://nodejs.org/en/download/)._

### Method 1:

- Download the executable from [here](https://github.com/SpoiledUnknown/Richcord-Presence/releases/tag/v1.5.1).
  - Double click the exe file.
  - Go through the simple prompts.
- Note: in some cases the exe file might not work in that case use bellow provided steps -
  - Open terminal (non-admin)
  - drag and drop the exe file to the ternimal window
  - press enter.

### Method 2:

- Clone the repo, or download the source code
  from [here](https://github.com/SpoiledUnknown/Richcord-Presence/releases/tag/v1.0.2).
- Open the ternimal at the location of the source code
- Use `cd "path/to/inside/of/source-code/"`, to access the source code.
- Run `npm install`.
- Run `npm run start` or `node index.js`

## How To Setup Dev Environment:

- Install NodeJs from [here](https://nodejs.org/en/download/).
- Clone the repo, or download the source code
  from [here](https://github.com/SpoiledUnknown/Richcord-Presence/releases/tag/v1.5.1).
- Open it using [VS Code](https://code.visualstudio.com/download) or any other Code Editor/IDE.
- Open console (in vs code press ctrl + `).
- Run `npm install`

## Custom Client Setup:

Go to the _[Discord Dev Portal](https://discord.com/developers/applications)_

1. Click on tthe _**New Application**_ button.
   ![Step 1](/public/step%201.png)
2. A new dailogue box appears.
3. Enter the name of the application (_**This shows as the app name in discord status**_)
4. Agree the terms of service.
5. Click on _create_
   ![Step 2](/public/step%202.png)
6. Click on _Rich Presence_
   ![Step 3](/public/step%203.png)
7. Scroll a little and click on _Add Images_
   - **Note:** _You can only add images more than 512x512 (1024x1024 is recommended)._
   - **Note:** _You can add upto 300 images._
     ![Step 4](/public/step%204.png)
8. Write the name of the asset.
   - **Note:** _You can't change the name once the asset is saved. If you want to change then delete and reupload the
     asset._
   - **Note:** _Remember the name you gave to the assets as they will have to write it as is while running the app_
9. Click on _Save Changes_ and wait for changes to be saved.
   ![Step 5](/public/step%205.png)
10. Now again click on _General Information_.
11. Scroll down a little bit to copy your client id.
    ![Step 6](/public/step%206.png)
12. Click on _Copy_.
    ![Step 7](/public/step%207.png)

#### The client setup is done, now you can just paste the client id when prompted.

## How To Use:

1. The app first asks the _**Client ID**_, which we have created using above provided method.
2. You then have to provide a _detail_ message. This message will be shown on detail area in discord
3. Then you have to provide a _status_ for your app.
4. Then provide the _Large Image Key_, the name of the asset uploaded in custom client setup.
5. Then provide a message for Large Image.
6. Same step for small image, write the name of small image asset.
7. and again a message for small image.
8. Then write the label for first button.
9. Then give a URL for the first button.
10. Follow the above 2 steps for second button as well
11. And lastly tell whether you want the timestamps to be shown or not.

![Example](/public/example.png)

#### You are all done, now enjoy the Richcord by flexing on your virtual friends since you most likely don't have any irl friends.
