# Discord Ticket Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A simple and efficient Discord ticket bot to help manage user support tickets on your server.
Easily create, track, and close support tickets via commands or interactions, helping your team stay organized.

---

## Features

* Create support tickets with a modal form
* Categorize tickets under different channels/categories
* Automatically assign roles and permissions to ticket creators and staff
* Close tickets and archive them in a closed tickets category
* Persistent ticket numbering per category
* Customizable ticket forms and categories (via environment variables)

---

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/lyvt-dev/discord-ticket-bot.git
   cd discord-ticket-bot
   ```

2. Install dependencies (Python example)

   ```bash
   npm install discord.js dotenv
   ```

3. Create a `.env` file with your bot token and category IDs, for example:

   ```
   TOKEN="<your bot token>"
   CLIENT_ID="<your client id>"
   GUILD_ID="<your guild id>"
   SUPPORT_ROLE_ID="<your support role id>"
   TICKET_CHANNEL_ID="<your ticket channel id>"
   BLACKLIST_ROLE_ID="<your blacklist role id>"
   TRANSCRIPT_CHANNEL_ID="<your transcript channel id>"
   # Add other categories as needed
   ```

4. Run the bot

   ```bash
   node .
   ```

---

## Usage

* Use slash commands `/createticket` to open a new ticket modal
* Fill in the required fields and submit the form
* A new ticket channel will be created with appropriate permissions
* Staff roles will be notified automatically
* Use `/close` or the close button to close tickets and archive them

---

## Configuration

* Customize your ticket categories, staff roles, and modal fields via the `.env`
* Modify the bot code to add new ticket types or change the embed styles

---

## Contributing

Feel free to submit issues and pull requests!
Make sure your code adheres to existing style and passes tests if any.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

Created by \[YourName or GitHub]
Feel free to reach out via GitHub Issues or email.

---

# LICENSE (MIT License)

```text
MIT License

Copyright (c) 2025 Lyvt-Dev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
