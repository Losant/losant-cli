const buildMetaDataObj = ({
  resource = {},
  md5,
  localInfo = {},
  remoteInfo = {}
}) => {
  let remoteTime, localTime;
  if (resource.lastUpdated) {
    remoteTime = new Date(resource.lastUpdated).getTime();
  } else {
    remoteTime = remoteInfo.remoteModTime;
  }
  if (localInfo.localModTime) {
    localTime = localInfo.localModTime * 1000;
  } else {
    localTime = Date.now();
  }
  const obj = {
    id: resource.id || remoteInfo.id || localInfo.id,
    name: resource.name || remoteInfo.name || localInfo.name,
    file: remoteInfo.file || localInfo.file,
    md5,
    remoteTime,
    localTime
  };
  return obj;
};

module.exports = {
  buildMetaDataObj
};

