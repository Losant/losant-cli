import getUploadParams from '../../lib/get-upload-params.js';
import upload from '../utils/upload.js';

const { files: params } = getUploadParams;

const helpLines = `
Upload all files
$ losant files upload
Upload files in images directory
$ losant files upload images/*
Force an upload of all files overwriting remote modifications
$ losant files upload -f
`;
export default (program) => {
  program.addHelpText('after', helpLines);
  upload(program, params);
};
