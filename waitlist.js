const form = document.querySelector('form');
const button = form.querySelector('button');
const status = document.createElement('p');
status.setAttribute('role', 'status');
form.after(status);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (location.protocol === 'file:') {
    status.textContent = 'Offline preview. Open the hosted page to join the waitlist.';
    return;
  }
  button.disabled = true;
  const fields = new FormData(form);
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: fields.get('email'), consent: fields.has('consent')})
    });
    if (!response.ok || (await response.json()).ok !== true) throw new Error();
    form.hidden = true;
    status.textContent = 'You’re on the list. Look out for PEAK launch news and beta invitations in your inbox.';
  } catch {
    status.textContent = 'We couldn’t save your email. Please try again.';
  } finally {
    button.disabled = false;
  }
});
