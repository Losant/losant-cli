import getDownloadParams from '../../lib/get-download-params.js';
import download from '../utils/download.js';

const { files: params } = getDownloadParams;

const helpLines = `
Download all files
$ losant files download
Download files in images directory
$ losant files download images/*
Force a download of all files overwriting local modifications
$ losant files download -f
`;

export default (program) => {
  program.addHelpText('after', helpLines);
  download(program, params);
};
