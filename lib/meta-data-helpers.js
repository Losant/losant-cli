const buildMetaDataObj = (resourceInfo, md5, localInfo) => {
  return {
    id: resourceInfo.id,
    name: resourceInfo.name,
    file: localInfo.file,
    md5,
    remoteTime: resourceInfo.remoteTime || new Date(resourceInfo.lastUpdated).getTime(),
    localTime: localInfo.localModTime * 1000
  };
};

module.exports = {
  buildMetaDataObj
};

