import express from 'express';
import fetch from 'node-fetch';
import cookieSession from 'cookie-session';

const app = express();

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const cookieSecret = process.env.COOKIE_SECRET;

app.use(cookieSession({
    secret: cookieSecret
}));

app.get('/', (req, res) => {
    res.send('Hello from CI/CD Pipeline! <a href="/login/github">[Login]</a>')
})

app.get('/login/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&client_url=https://cloud-run-tests.andrade.inf.br/login/github/callback`;
    res.redirect(url);
})

async function getAccessToken (code) {
    const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code
        })
    });
    const data = await res.text();
    const params = new URLSearchParams(data);
    return params.get('access_token');
}

async function getGithubUser (access_token) {
    const res = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `bearer ${access_token}`
        }
    });
    const data = await res.json();
    return data;
}

app.get('/login/github/callback', async (req, res) => {
    const code = req.query.code;
    const token = await getAccessToken(code);
    const githubData = await getGithubUser(token);
    if (githubData) {
        console.log(githubData);
        req.session.gitHubId = githubData.id;
        req.session.token = token;
        res.redirect('/admin');
    } else {
        console.log('Error happened');
        res.send('Error happened');
    }
});

app.get('/admin', async (req, res) => {
    if (req.session.gitHubId === 30292455) {
        res.send('Hello Rafael  <a href="/logout">[Logout]</a>');
    } else {
        res.send('Not Authorized');
    }
});

app.get('/logout', async (req, res) => {
    req.session = null;
    res.redirect('/');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Listening...'));