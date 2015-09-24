var request = require('request'),
  async = require("async");

var Defaults = {
  itemListLayout: 'List_Layout_1',
  itemListBgImage: "",
  itemDetailsBgImage: "",
  description: '<p>&nbsp;<br></p>',
  sortValue: "Newest",
  manualListLayout: "list-1",
  manualItemLayout: "item-1",
  manualBackgroundImage: ""
};

var fetchYoutubeUserId = function (rssUrl) {
  var regex = /gdata\.youtube\.com\/.*\/users\/([a-zA-Z0-9_\-]{1,})\/?/;
  var res = rssUrl.match(regex);
  if (res && res.length) {
    return res.pop();
  } else {
    return null;
  }
};

var getYoutubeFeedUrl = function (rssUrl) {
  var userId = fetchYoutubeUserId(rssUrl);
  if (userId)
    return "https://www.youtube.com/user/" + userId;
  else
    return null;
};

var fetchVimeoUserName = function (rssUrl) {
  var regex = /vimeo\.com\/([a-zA-Z0-9_\-]{1,})\/?/;
  var res = rssUrl.match(regex);
  if (res && res.length) {
    return res.pop();
  } else {
    return null;
  }
};

var getVimeoFeedUrl = function (rssUrl) {
  var userName = fetchVimeoUserName(rssUrl);
  if (userName)
    return "https://vimeo.com/" + userName;
  else
    return null;
};

exports.convert = function (oldInfo, cb) {
  var out = [], tasks = [];
  oldInfo.Content.Sections.forEach(function (item) {
    console.log(item.Title);
    switch (item.Title) {
      case "YouTube" :
        tasks.push(function (callback) {
          var userId = fetchYoutubeUserId(item.RssUrl);
          var feedApiUrl = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=" + userId + "&key=AIzaSyC5d5acYzAtC9fiDcCOvvpA-xX9dKwkmAA";
          request(feedApiUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              body = JSON.parse(body);
              console.log(body.items);
              var playlistId = body.items[0].contentDetails.relatedPlaylists.uploads;
              var data = {
                data: {
                  content: {
                    carouselImages: [],
                    description: item.Summary || "",
                    type: "Channel Feed",
                    rssUrl: getYoutubeFeedUrl(item.RssUrl),
                    playListID: playlistId
                  },
                  design: {
                    itemListLayout: Defaults.itemListLayout,
                    itemListBgImage: Defaults.itemListBgImage,
                    itemDetailsBgImage: Defaults.itemDetailsBgImage
                  }
                },
                tag: "YouTubeInfo"
              };
              callback(null, data);
            }
            else
              callback(error, null);
          });
        });
        break;
      case "Vimeo" :
        var data = {
          data: {
            content: {
              carouselImages: [],
              description: item.Summary || "",
              type: "Channel Feed",
              rssUrl: getVimeoFeedUrl(item.RssUrl),
              feedID: fetchVimeoUserName(item.RssUrl)
            },
            design: {
              itemListLayout: Defaults.itemListLayout,
              itemListBgImage: Defaults.itemListBgImage,
              itemDetailsBgImage: Defaults.itemDetailsBgImage
            }
          },
          tag: "VimeoInfo"
        };
        out.push(data);
        break;
      case "Manual" :
      /* var data = {
       data: {
       content: {
       images: [],
       descriptionHTML: item.Summary || "",
       description: "",
       sortBy : Defaults.sortValue,
       rankOfLastItem : 0
       },
       design: {
       listLayout: Defaults.manualListLayout,
       itemLayout: Defaults.manualItemLayout,
       backgroundImage: Defaults.manualBackgroundImage
       }
       },
       tag: "mediaCenter"
       };

       out.push(data);
       break;*/
    }
  });
  async.parallel(tasks, function (err, resp) {
    console.log(err, resp);
    if (err)
      cb(out);
    else
      cb(resp.concat(out));
  });
};
