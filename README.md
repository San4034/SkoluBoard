# SkoluBoard

Digital signage system for school TV screens. Manage media content, display schedules from Google Sheets, and show live bell schedule indicators — all from a web-based admin panel.

## Features

- **Media groups** — organize images, videos, YouTube streams, and schedule slides into groups
- **Google Sheets integration** — display substitution/schedule data fetched directly from a spreadsheet
- **Bell schedule** — shows the current lesson indicator on schedule slides in real time
- **Multi-language UI** — admin panel available in English and Latvian
- **User management** — multiple admin accounts with role-based access
- **Activity log** — full audit trail of admin actions

## Tech stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Auth:** JWT tokens

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/your-username/skoluboard.git
cd skoluboard

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set a strong JWT_SECRET

# 4. Start the server
npm start
```

Open [http://localhost:3031/login.html](http://localhost:3031/login.html) in your browser.
On first launch you will be prompted to create an administrator account.

## License

SkoluBoard is licensed under the **GNU General Public License v3** — see [LICENSE](LICENSE) for details.

For use in proprietary or commercial products, a separate commercial license is available.
See [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md) or contact **aleksandrs.malecs@gmail.com**.

## Author

Aleksandrs Malecs — aleksandrs.malecs@gmail.com
