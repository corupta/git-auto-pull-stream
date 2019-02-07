module.exports = (config) => {
  const http = require("http");
  const exec = require("child_process").exec;
  const path = require("path");
  const ReadableStream = require("stream").Readable;

  const projectPath = process.argv[2];
  const absolutePath = path.join(__dirname, '../../', projectPath);

  exec('export LANG=C.UTF-8');

  console.log('projectPath argument:', projectPath);
  console.log('absolutePath: ', absolutePath);

  const maxBuffer = 1024 * 1024 * 200; // 200 MiB
  const PORT = 1337;
  const POLL_INTERVAL = 4000; // 4 Seconds

  let cmds = config;

  if (cmds) {
    console.log('command argument is read successfully:');
    cmds = Object.keys(cmds)
      .filter(key => cmds.hasOwnProperty(key))
      .map(key => ({[key]: ["git pull", ...cmds[key]] }))
      .reduce((acc, x) => ({...acc, ...x}), {});
  } else {
    cmds = {};
  }

  if (!cmds["default"]) {
    cmds["default"] = ["git pull"];
  }

  console.log(cmds);

  const updateProject = function (type = "default", callbackProcess, callbackFinal) {
    const commands = cmds[type] || cmds["default"];
    const runner = (index) => {
      if (commands.length <= index) {
        callbackFinal();
      } else {
        const cmd = commands[index];
        console.log('running', cmd);
        callbackProcess(`running ${cmd}`);
        exec(`cd ${absolutePath} && ${cmd}`, {maxBuffer}, (err, stdout, stderr) => {
          if (err) {
            callbackFinal(err);
          } else {
            callbackProcess(`--- ${cmd} ---:\n stdout: ${stdout} \n stderr: ${stderr}`);
            runner(index + 1);
          }
        });
      }
    };
    runner(0);
  };

  http.createServer(function (req, res) {
    if (req.url === '/favicon.ico') {
      res.writeHead(404);
      res.end();
      return;
    }
    const type = req.url.substr(1) || req.headers['type'];
    console.log("An event has been detected of type,", type, ", on the listened port: starting execution...")

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', "text/plain; charset=UTF-8");
    res.writeHead(202);
    const stream = new ReadableStream({
      read() {
      }
    });
    stream.pipe(res);
    stream.push(`Starting to process with type, ${type}\n\n`);
    const interval = setInterval(() => {
      stream.push('................................................................................\n');
    }, POLL_INTERVAL);
    updateProject(type, (result) => {
      if (result) {
        console.log(result);
        stream.push(`${result}\n`);
      }
    }, (e) => {
      if (e) {
        console.error(`exec error: ${e}`);
        stream.push(`exec error: ${e}\n`);
      }
      stream.push(`finished process of type, ${type}\n`);
      console.log(`finished process of type, ${type}`);
      clearInterval(interval);
      stream.push(null);
    });

  }).listen(PORT);
  console.log("Git-auto-pull-stream is running");
};
