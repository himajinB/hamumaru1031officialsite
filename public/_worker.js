const PASSWORD = "samemaru2949";
const COOKIE_NAME = "cf_site_auth";
const COOKIE_VALUE = "auth_ok_samemaru";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cookieHeader = request.headers.get("Cookie") || "";
    const isAuthenticated = checkCookie(cookieHeader);

    if (request.method === "POST" && url.pathname === "/auth-login") {
      try {
        const formData = await request.formData();
        const password = formData.get("password");
        if (password === PASSWORD) {
          return new Response(null, {
            status: 303,
            headers: {
              "Location": "/",
              "Set-Cookie": `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
            }
          });
        }
      } catch (e) {
        // ignore
      }
      return htmlResponse(true);
    }

    if (!isAuthenticated) {
      return htmlResponse(false);
    }

    return env.ASSETS.fetch(request);
  }
};

function checkCookie(cookieHeader) {
  const cookies = cookieHeader.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === COOKIE_NAME && value === COOKIE_VALUE) {
      return true;
    }
  }
  return false;
}

function htmlResponse(hasError) {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>パスワード認証</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background: #f7f7f8;
    color: #333;
  }
  .card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    width: 100%;
    max-width: 320px;
    box-sizing: border-box;
    text-align: center;
  }
  h2 {
    margin-top: 0;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0 1rem 0;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 1rem;
    outline: none;
  }
  input[type="password"]:focus {
    border-color: #0070f3;
  }
  button {
    width: 100%;
    padding: 0.75rem;
    background: #0070f3;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
  }
  button:hover {
    background: #005bb5;
  }
  .error {
    color: #e00;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }
</style>
</head>
<body>
  <div class="card">
    <h2>パスワード認証</h2>
    ${hasError ? '<div class="error">パスワードが間違っています</div>' : ''}
    <form method="POST" action="/auth-login">
      <input type="password" name="password" placeholder="パスワードを入力" required autofocus>
      <button type="submit">ログイン</button>
    </form>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: hasError ? 401 : 200,
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
