const { isNotEmpty } = require('omnibelt');

const buildMetaDataObj = ({
  resource = {},
  md5,
  localStatus = {},
  remoteStatus = {}
}) => {
  if (isNotEmpty(resource)) {
    return {
      id: resource.id,
      name: resource.name,
      file: localStatus.file,
      md5,
      localTime: localStatus.localModTime * 1000,
      remoteTime: new Date(resource.lastUpdated).getTime()
    };
  }
  if (isNotEmpty(remoteStatus)) {
    let localTime = Date.now();
    if (isNotEmpty(localStatus)) {
      localTime = localStatus.localModTime * 1000;
    }
    return {
      id: remoteStatus.id,
      name: remoteStatus.name,
      file: remoteStatus.file,
      md5: remoteStatus.remoteMd5,
      localTime,
      remoteTime: remoteStatus.remoteModTime
    };
  }
};

module.exports = {
  buildMetaDataObj
};

