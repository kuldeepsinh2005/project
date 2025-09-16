const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.transcribeWithWhisper = async (audioPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(audioPath);
    const fileNameWithoutExt = path.basename(audioPath, path.extname(audioPath));
    const outputVTT = path.join(outputDir, `${fileNameWithoutExt}.vtt`);

    const args = [
      audioPath,
      '--model', 'base',
      '--language', 'English',
      '--output_format', 'vtt',
      '--output_dir', outputDir,
    ];

    console.log('[Whisper] Running command: whisper', args.join(' '));

    const whisper = spawn('whisper', args);

    whisper.stdout.on('data', (data) => {
      console.log('[Whisper STDOUT]:', data.toString());
    });

    whisper.stderr.on('data', (data) => {
      console.error('[Whisper STDERR]:', data.toString());
    });

    whisper.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Whisper process exited with code ${code}`));
      }

      if (!fs.existsSync(outputVTT)) {
        console.error('[Whisper] VTT file not found at:', outputVTT);
        return reject(new Error('VTT file not created.'));
      }

      console.log('[Whisper] VTT file created at:', outputVTT);
      resolve(outputVTT);
    });
  });
};
