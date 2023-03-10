var axios = require('axios');
var data = JSON.stringify({
  comment: {
    content: [
      {
        content: [
          {
            text: 'I did some work here.',
            type: 'text',
          },
        ],
        type: 'paragraph',
      },
    ],
    type: 'doc',
    version: 1,
  },
  started: '2021-01-19T12:34:00.000+0000',
  timeSpentSeconds: 60,
});

var config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.atlassian.com/ex/jira/0f06b500-1b44-4005-a147-5b2ebe38c710/rest/api/3/issue/10002/worklog',
  headers: {
    Authorization:
      'Bearer eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIyMjJiYTc0NS01YjBjLTQ2M2YtOTYyNC1kYmNhNDdlZGJlMDEiLCJzdWIiOiI2MjhjYmIwNmYyMjYxZTAwNjgyOWMyNDUiLCJuYmYiOjE2NzgzNTAxNjQsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NzgzNTAxNjQsImV4cCI6MTY3ODM1Mzc2NCwiYXVkIjoiQjIzVEt0RkYzOUg1OXBKQ1FvdGRyenF6RVdveGVpVXkiLCJjbGllbnRfaWQiOiJCMjNUS3RGRjM5SDU5cEpDUW90ZHJ6cXpFV294ZWlVeSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiI3MzJhNDVmOS04MDVmLTQwZWMtYTlkNi0xZjU1MWM5MzFkM2IiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudElkIjoiNjNmMzMyZmYxMjIzOTc0YmMwNGEwOGU5Iiwic2NvcGUiOiJtYW5hZ2U6amlyYS1jb25maWd1cmF0aW9uIG1hbmFnZTpqaXJhLWRhdGEtcHJvdmlkZXIgbWFuYWdlOmppcmEtcHJvamVjdCBtYW5hZ2U6amlyYS13ZWJob29rIG9mZmxpbmVfYWNjZXNzIHJlYWQ6amlyYS11c2VyIHJlYWQ6amlyYS13b3JrIHdyaXRlOmppcmEtd29yayIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9hdGxfdG9rZW5fdHlwZSI6IkFDQ0VTUyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImJyYWluc3RhdGlvbi0yMy5jb20iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZmlyc3RQYXJ0eSI6ZmFsc2UsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS92ZXJpZmllZCI6dHJ1ZSwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL29hdXRoQ2xpZW50SWQiOiJCMjNUS3RGRjM5SDU5cEpDUW90ZHJ6cXpFV294ZWlVeSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9yZWZyZXNoX2NoYWluX2lkIjoiQjIzVEt0RkYzOUg1OXBKQ1FvdGRyenF6RVdveGVpVXktNjI4Y2JiMDZmMjI2MWUwMDY4MjljMjQ1LWUzYmQyNDVkLWU3NWYtNDhlYS1iMDNjLWZkYWZjMGQyYzk2NiIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50RW1haWwiOiJjYWZhMDE2OC1hYjg0LTQyOTgtYWIyMi1iMDRhZWJkNjU1MWZAY29ubmVjdC5hdGxhc3NpYW4uY29tIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tLzNsbyI6dHJ1ZSwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2YTFmYjNiYy1lMGFkLTRmODAtODdkYi1kN2FlYzYyNDEwMjYiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50RW1haWxEb21haW4iOiJjb25uZWN0LmF0bGFzc2lhbi5jb20ifQ.ByZWHVQHkQyGMeG_fNHjLPK3pf8ykGnZzSbAUWuBa0FL7jgmzm-JQaG7b_vmB1kXjsLUykhbzr4JJE7MyRvxFtXeoK2b4hmwwGGyq2lyh1w6ZyRiT4eOGoI072Cr6qS7TGsP6XpmpesUrMyuQAeV8mwcVsM1UrNIHmfHLU8uE2eHbFFjrqWZXDbZY9RRf_83Yk_N3LFCnud40I0XSL9n2iYxlonVstgtXyW05CV_YIT8UNKbPdjMgpyaZhJ3fQZL4LNbvmXfjlZz54-2Wpkq9HOfhshWOHUjgs5lcmEkzlV4MSfdFIrAAAaJmNeS--D2N-jWnETDPzcIvmhupIVKUg',
    'Content-Type': 'application/json',
    Cookie:
      'atlassian.xsrf.token=72000998-61f7-4166-a6ee-b5d1dda1a9a8_1c6457ec85d070579648e1907633c6333b5b3c86_lin',
  },
  data: data,
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
