(function () {
  var Defaults = {
    itemListLayout: 'List_Layout_1',
    itemListBgImage: "",
    itemDetailsBgImage: "",
    description: '<p>&nbsp;<br></p>'
  };

  var fetchUserlId = function (rssUrl) {
    var regex = /gdata\.youtube\.com\/.*\/users\/([a-zA-Z0-9_\-]{1,})\/?/;
    var res = rssUrl.match(regex);
    if (res && res.length) {
      return res.pop();
    } else {
      return null;
    }
  };

  var getFeedUrl = function (rssUrl) {
    var userId = fetchUserlId(rssUrl);
    if (userId)
      return "https://www.youtube.com/user/" + userId;
    else
      return null;
  };

  var getPlayListId = function (rssUrl) {

  };

  var _convertTo = function (section) {

    // Check if the plugin data is for YouTube
    if (section.Title == "YouTube" && section.EventSource == "feed") {
      //Check if RSS feed is valid and we have valid UserId
      if (fetchUserlId(section.RssUrl)) {
        var youtubeInfo = {
          content: {
            carouselImages: [],
            description: section.Summary || "",
            type: "Channel Feed",
            rssUrl: getFeedUrl(section.RssUrl),
            playListID: getPlayListId(section.RssUrl)
          },
          design: {
            itemListLayout: Defaults.itemListLayout,
            itemListBgImage: Defaults.itemListBgImage,
            itemDetailsBgImage: Defaults.itemDetailsBgImage
          }
        };
        return {
          youtubeInfo: youtubeInfo
        };
      } else
        return null;
    }
  };

  var YouTubeMigrator = (function () {
    var YouTubeMigrator = {
      convert: function (oldInfo) {
        var currentYoutubeList = [];
        var content = oldInfo.Content;
        if (typeof content == 'undefined') {
          return currentYoutubeList;
        }
        var sections = content.Sections;
        var widgetInfo = content.Info;
        if (!Array.isArray(sections)) {
          return currentYoutubeList;
        }
        sections.forEach(function (section) {
          var convertedData = _convertTo(section);
          if (convertedData)
            currentYoutubeList.push(convertedData);
          else
            console.log("Error converting data for Id: " + section.Id);
        });
        return currentYoutubeList;
      }
    };
    return YouTubeMigrator;
  })();
  exports = module.exports = YouTubeMigrator;
})();