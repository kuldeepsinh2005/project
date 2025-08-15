export async function apiFetch(url, options = {}) {
  const res = await fetch(`http://localhost:5000${url}`, {
    credentials: 'include', // important for cookies
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
