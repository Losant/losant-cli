import getUploadParams from '../../lib/get-upload-params.js';
import constants from '../../lib/constants.js';
import upload from '../utils/upload.js';

const { experience: params } = getUploadParams;

const helpLines = `
Upload all experience views
$ losant experience upload
Upload only component views
$ losant experience upload --type components /*
`;

export default (program) => {
  program.addHelpText('after', helpLines);
  const options = [ constants.options.viewType ];
  upload(program, params, options);
};
