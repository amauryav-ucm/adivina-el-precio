const DEBUG = true;

function getApiURL(){
    return DEBUG
    ? 'http://localhost:3001'
    : 'https://test-9p0r.onrender.com';
}
