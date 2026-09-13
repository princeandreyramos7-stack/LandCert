import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// A stalled connection used to spin forever with no way to tell the user.
// Generous enough for a slow mobile link and a report with many rows, but
// finite, so a dead request reaches a catch block and shows an error.
window.axios.defaults.timeout = 30000;
