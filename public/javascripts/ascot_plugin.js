/*
 *  ascot_plugin.js
 *
 *  Created on: January 7, 2012
 *      Author: Valeri Karpov
 *
 *  Completely independent Javascript plugin for displaying Ascot overlay
 *  on all images with the 'ascot' hash parameter
 *
 */

function AscotPlugin(tagSourceUrl) {
  this.parseHashParams = function(url) {
    if (url.indexOf('#') < 0) {
      return {};
    }
    var ret = {};
    url = url.substring(url.indexOf('#'));
    var regex = new RegExp('[#&][^&;=]+' + '=' + '[^&#?;]+', 'g');
    var sp = url.match(regex);
    if (!sp) {
      return {};
    }

    for (var i = 0; i < sp.length; ++i) {
      var spp = sp[i].split('=');
      if (spp.length == 2) {
        if (spp[1].charAt(spp[1].length - 1) == '&' || spp[1].charAt(spp[1].length - 1) == '#' || spp[1].charAt(spp[1].length - 1) == '?') {
          spp[1] = spp[1].substr(0, spp[1].length - 1);
        }
        spp[0] = spp[0].substr(1);
        if (spp[0].charAt(0) == '/') {
          spp[0] = spp[0].substr(1);
        }
        ret[spp[0]] = spp[1];
      } else {
        ret[spp[0]] = '';
      }
    }

    return ret;
  };

  this.getAscotHashParam = function(url) {
    if (url.lastIndexOf('#') < 0) {
      return null;
    } else {
      url = url.substring(url.lastIndexOf('#'));
    }

    var regex = new RegExp('#[.*&]?' + 'ascot' + '=' + '([^&;]+?)(&|#|\\?|$)');
    var sp = regex.exec(url);

    if (sp == null) {
      return null;
   }
    
    if (sp.length == 0) {
      return null;
    } else {
      var keyValuePair = sp[0];
      var val = keyValuePair.substring('#ascot='.length);
      if (val.charAt(val.length - 1) == '&' ||
          val.charAt(val.length - 1) == '#' ||
          val.charAt(val.length - 1) == '?') {
        val = val.substring(0, val.length - 1);
      }
      return decodeURIComponent(val);
    }
  };

  this.getAscotIdFromParentHref = function(image) {
    var href = image.parent().attr('href');
    var alt = image.attr('alt');
    if (href && href.toLowerCase().indexOf(tagSourceUrl) != -1) {
      var searchString = tagSourceUrl + '/look/'; 
      return href.toLowerCase().substr(
          href.indexOf(searchString) + searchString.length, '50f8bae560ad830943000004'.length);
    }
    return null;
  }

  this.htmlifyTags = function(look) {
    var ret = look.title;
    ret += (look.source.length > 0 ? "<br>Source: " + look.source : "");
    ret += "<br><br>";
    for (var i = 0; i < look.tags.length; ++i) {
      var tag = look.tags[i];
      ret += (i > 0 ? "<br>" : "") + (i + 1) + ". ";
      ret += "<a href='" + tag.product.buyLink + "'>" + 
             "<b>" + tag.product.brand + "</b> " + tag.product.name +
             "</a>"; 
    };
    return ret;
  };

  this.tumblrUrlGenerator = function(htmlifyTags, encodeURIComponent) {
    return function(look) {
      return  'http://www.tumblr.com/share/photo?' +
              'source=' + encodeURIComponent(look.url) +
              '&clickthru=' + encodeURIComponent('http://www.ascotproject.com/look/' + look._id) +
              '&caption=' + encodeURIComponent(htmlifyTags(look)) +
              '&tags=ascot';
    };
  };

  this.getTumblrShareUrl = this.tumblrUrlGenerator(this.htmlifyTags, encodeURIComponent);

  this.getTwitterUrl = function(url) {
    return "https://twitter.com/share?url=" + encodeURIComponent(url) + "&via=AscotProject";
  };

  this.getIframeCode = function(look) {
    return '<iframe src="http://www.ascotproject.com/look/' + look._id + '/iframe" width="' + look.size.width + '" height="' + look.size.height + '" frameborder="0" scrolling="no"></iframe>';
  };

  this.getFacebookUrl = function(look) {
    return tagSourceUrl + '/fb/upload/' + look._id;
  };

  this.getPinterestUrl = function(look) {
    var descr = (look.title);
    for (var i = 0; i < look.tags.length; ++i) {
      descr += ' / ' + (i + 1) + '. ' + look.tags[i].product.brand + ' ' + look.tags[i].product.name;
      if (look.tags[i].product.buyLinkMinified) {
        descr += ' ' + look.tags[i].product.buyLinkMinified;
      }
    }
    return '//pinterest.com/pin/create/button/?url=' + encodeURIComponent(tagSourceUrl + '/look/' + look._id) +
        '&media=' + encodeURIComponent(look.taggedUrl) +
        '&description=' + encodeURIComponent(descr);
  };

  this.getImageMap = function(look) {
    var ret = "<img src='" + look.taggedUrl + "' usemap='#ascot" + look._id + "'>";
    ret += "<map name='ascot" + look._id + "'>";
    for (var i = 0; i < look.tags.length; ++i) {
      var url =
          (look.tags[i].product.buyLinkReadable || look.tags[i].product.buyLink) ||
          (tagSourceUrl + '/look/' + look._id);
      var longName = look.tags[i].product.brand + ' ' + look.tags[i].product.name;
      ret +=  "<area shape='circle'" +
              " coords='" + look.tags[i].position.x + "," + look.tags[i].position.y + ",15'" +
              " href='" + url + "'" +
              " title='" + longName + "'" +
              " alt='" + longName + "'" +
              " target='_blank'>";
    }
    ret += "</map>";
    ret += "<br>";
    for (var i = 0; i < look.tags.length; ++i) {
      ret += (i + 1) + ". ";
      if (look.tags[i].product.buyLink) {
        ret +=  "<a href='" +
                (look.tags[i].product.buyLinkReadable || look.tags[i].product.buyLink) +
                "' target='_blank'>";
      }
      ret += "<b>" + look.tags[i].product.brand + "</b> ";
      ret += look.tags[i].product.name;
      if (look.tags[i].product.buyLink) {
        ret += "</a>";
      }
      ret += "<br>";
    }
    return ret;
  };
};

function AscotPluginTag(defaultSize, position, product) {
  this.position = position;
  this.product = product;

  this.computeDisplayPosition = function(actualSize) {
    var x = (position.x / defaultSize.width) * actualSize.width;
    var y = (position.y / defaultSize.height) * actualSize.height;

    if (x + 20 >= actualSize.width) {
      x = actualSize.width - 20;
    }
    if (y + 20 >= actualSize.height) {
      y = actualSize.height - 20;
    }

    var corners = {};
    if (corners) {
      if (x <= 40 && y <= 40) {
        corners.upperLeft = true;
      }
      if (x + 40 >= actualSize.width && y <= 40) {
        corners.upperRight = true;
      }
      if (x + 40 >= actualSize.width && y + 40 >= actualSize.height) {
        corners.bottomRight = true;
      }
      if (x <= 40 && y + 40 >= actualSize.height) {
        corners.bottomLeft = true;
      }
    }

    return { position : { x : x, y : y }, corners : corners };
  };

  this.computeDescriptionOffset = function(actualSize) {
    var offset = 8;
    var ret = {};
    if (tagPosition.x > width / 2.0) {
      ret['right'] = offset + 'px';
    } else {
      ret['left'] = offset + 'px';
    }

    if (tagPosition.y > height / 2.0) {
      ret['bottom'] = offset + 'px';
    } else {
      ret['top'] = offset + 'px';
    }

    return ret;
  };
}

function AscotPluginUI(tagSourceUrl, myUrl, look, plugin) {
  this.constructTagContainer = function(overlay, tagContainer, actualSize, pluginTag) {
    var pos = pluginTag.computeDisplayPosition(actualSize);

    var tagX = pos.position.x;
    var tagY = pos.position.y;

    tagContainer.css("left", tagX);
    tagContainer.css("top", tagY);

    if (tagContainer.parent().get(0) != overlay) {
      tagContainer.appendTo(overlay);
    }

    return pos;
  };

  this.constructTagDescription = function(height, width, tagContainer, tagDescription, tag, tagPosition) {
    tagDescription.html(
        "<b>" +
        "<a id='ascot_overlay_link' target='_blank' href='" + tagSourceUrl + "/brand?v=" + encodeURIComponent(tag.product.brand).replace('\'', '&#39') + "'>" +
        tag.product.brand + "</b></a> " +
        "<a target='_blank' href='" + tagSourceUrl + "/product?brand=" + encodeURIComponent(tag.product.brand).replace('\'', '&#39') + "&name=" + encodeURIComponent(tag.product.name).replace('\'', '&#39') +"'>" +
        tag.product.name +
        "</a>" +
        "<br/>" +
        (tag.product.buyLink.length > 0 ? "<a id='ascot_overlay_buy_button' target='_blank' onclick='_gaq.push([\"ascot._trackEvent\", \"buyLinkClicked\", \"" + myUrl + "\", \"" + tag.product.buyLink + "\"])' href='" + tag.product.buyLink + "'>"+
        (tag.buyLinkText || "Buy") +
        "</a><br/>" : ""));

    var offset = 8;
    if (tagPosition.x > width / 2.0) {
      tagDescription.css('right', offset + 'px');
    } else {
      tagDescription.css('left', offset + 'px');
    }
                
    if (tagPosition.y > height / 2.0) {
      tagDescription.css('bottom', offset + 'px');
    } else {
      tagDescription.css('top', offset + 'px');
    }
                
    tagDescription.appendTo(tagContainer);
    tagDescription.hide();
  };

  this.handleUpvoteLook = function(jsonp, upvoteButton, ascotId) {
    jsonp(tagSourceUrl + '/upvote/' + ascotId + '.jsonp', function(json) {
      if (json.add) {
        upvoteButton.attr('src', tagSourceUrl + '/images/overlayOptions_heart_small_opaque.png');
        upvoteButton.css('cursor', 'pointer');
        upvoteButton.css('opacity', '1');
      } else if (json.remove) {
        upvoteButton.attr('src', tagSourceUrl + '/images/overlayOptions_heart_small.png');
        upvoteButton.css('cursor', 'pointer');
        upvoteButton.css('opacity', '0.6');
      } else {
        // Nothing to do here for now, just ignore
      }
    });
  };

  this.createIframeDisplay = function(menuWrapper, iframeCode) {
    menuWrapper.append(
          '<div class="ascot_overlay_share_menu" style="right: 172px; width: 152px; top: 35px; height:150px">' +
          '<div class="ascot_overlay_share_arrow" style="right: -20px;">' +
          '<img id="ascot_overlay_share_arrow" src="' + tagSourceUrl + '/images/popupArrow_border.png"></div>' + 
          '<p id="ascot_overlay_embed_instruct">Copy code & paste in body of your site</p>' +
          '<textarea onclick="_gaq.push([\'ascot._trackEvent\', \'embedClick\', \'' + look._id +
          '\', \'' + myUrl + '\']);">' +
          iframeCode +
          '</textarea></div>');
    return menuWrapper.children().last();
  };

  this.createEmailDisplay = function(menuWrapper, htmlCode) {
    menuWrapper.append(
          '<div class="ascot_overlay_share_menu ascot_overlay_html_display">' +
          '<div class="ascot_overlay_share_arrow" style="right: -20px; top: 120px">' +
          '<img id="ascot_overlay_share_arrow" src="' + tagSourceUrl + '/images/popupArrow_border.png"></div>' + 
          '<p id="ascot_overlay_embed_instruct">Copy code & paste in body of your site or email</p>' +
          '<textarea onclick="_gaq.push([\'ascot._trackEvent\', \'htmlClick\', \'' + look._id +
          '\', \'' + myUrl + '\']);">' +
          htmlCode +
          '</textarea></div>');
    return menuWrapper.children().last();
  };

  this.appendSocialTool = function(name, icon, url) {
    return  '<li id="ascot_overlay_share">' +
            '  <a target="_blank" onclick="' + this.createShareMenuGACommand(name.toLowerCase()) + '" href="' + url + '">' +
            '    <div class="ascot_overlay_social_icon">' +
            '      <img id="ascot_overlay_social" src="' + icon + '">' +
            '    </div>' +
            '    <div class="ascot_overlay_social_name">' + name + '</div>' +
            '  </a>' +
            '</li>';
  };

  this.createShareMenuGACommand = function(name) {
    return "_gaq.push([\'ascot._trackEvent\', '" + name + "', '" + look._id + "', '" + myUrl + "'])";
  }

  this.createShareMenu = function(menuWrapper, tumblrUrl, twitterUrl, facebookUrl, pinterestUrl) {
    menuWrapper.append(
          '<div class="ascot_overlay_share_menu">' +
          '<div class="ascot_overlay_share_arrow">' + 
          '<img id="ascot_overlay_share_arrow" src="' + tagSourceUrl + '/images/popupArrow_border.png">' +
          '</div>' +
          '<ul id="ascot_overlay_share_list">' + 
          this.appendSocialTool('Tumblr', tagSourceUrl + '/images/socialTumblr.png', tumblrUrl) + 
          '<br>' +
          '<li id="ascot_overlay_share" class="embedLink" style="cursor: pointer">' +
          '<div class="ascot_overlay_social_icon">' +
          '<img id="ascot_overlay_social" src="' + tagSourceUrl + '/images/socialEmbed.png">' +
          '</div>' +
          '<div class="ascot_overlay_social_name">Embed</div></li>' + 
          '<br>' +
          this.appendSocialTool('Twitter', tagSourceUrl + '/images/socialTwitter.png', twitterUrl) +
          '<br>' +
          this.appendSocialTool('Facebook', tagSourceUrl + '/images/socialEmbed_facebook.png', facebookUrl) +
          '<br>' +
          this.appendSocialTool('Pinterest', tagSourceUrl + '/images/socialEmbed_pinterest.png', pinterestUrl) +
          '<br><li id="ascot_overlay_share" class="embedLink" style="cursor: pointer">' +
          '<div class="ascot_overlay_social_icon">' +
          '<img id="ascot_overlay_social" src="' + tagSourceUrl + '/images/socialEmail.png">' +
          '</div>' +
          '<div class="ascot_overlay_social_name">Email</div>' +
          '</li>' + 
          '</ul></div>');
    return menuWrapper.children().last();
  };

  this.createImageMenu = function(menuWrapper) {
    menuWrapper.append(
      '<div class="ascot_overlay_image_menu">' +
      '<div><img style="cursor: pointer; height: 28px; width: 24px;" id="ascot_overlay_menu_item" src="' +
      tagSourceUrl + '/images/overlayOptions_share.png"></a></div>' +
      '<div><img id="ascot_overlay_menu_item" style="cursor: pointer; height: 24px; width: 24px;" src="' +
      tagSourceUrl + '/images/overlayOptions_heart_small.png"></a></div>' +
      '</div>');
    return menuWrapper.children().last();
  };

  this.createSourceTag = function(overlay) {
    if (look.source.indexOf('http://') != -1) {
      overlay.append(
          '<div class="ascot_overlay_source_tag">i<div class="ascot_overlay_source_url">' +
          '<a href="' +
          look.source + '\">' +
          look.source +
          '</a>' +
          '</div>');
    } else {
      overlay.append(
          '<div class="ascot_overlay_source_tag">i<div class="ascot_overlay_source_url">' +
          look.source +
          '</div>');
    }
    return overlay.children().last();
  };
}

function AscotPluginViewConfig(config) {
  this.config = config;

  this.shouldShowAnimateButton = function() {
    if (!config || !config.behavior) {
      return true;
    }
    return this.config.behavior.displayTagsOnInit == "SHOW";
  };

  this.shouldShowTagsOnMouseover = function() {
    if (!config || !config.behavior) {
      return false;
    }
    return this.config.behavior.displayTagsOnInit == "SHOW_ON_MOUSEOVER";
  };

  this.scaleFactor = function() {
    if (!config || !config.display) {
      return 1;
    }
    return config.display.tagSizeModifier || 1;
  };

  this.getBorderWidth = function() {
    if (!config || !config.display) {
      return 3;
    }
    if (config.display.borderWidth == 0) {
      return 0;
    }
    return config.display.borderWidth || 3;
  };

  this.getBackgroundColor = function() {
    if (!config || !config.display) {
      return "#171717";
    }
    return config.display.backgroundColor;
  };

  this.shouldShowSourceTag = function() {
    if (!config || !config.behavior) {
      return false;
    }
    return this.config.behavior.displayTagsOnInit !== "SHOW_ON_MOUSEOVER";
  };
}

function initAscotPlugin($, tagSourceUrl, config, stopwatch, usePIE) {
  var lookCache = {};
  var ret = {};

  if (!window._gaq) {
    // Insert Google Analytics if it doesn't already exist
    window._gaq = [];
    
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  }

  var profile = {
    start : function(tag) {
      if (stopwatch) {
        stopwatch.start(tag);
      }
    },
    stop : function(tag) {
      if (stopwatch) {
        stopwatch.stop(tag);
      }
    }
  };
  
  _gaq.push(function() {
    _gaq.push(['ascot._setAccount', 'UA-36829509-1']);
    _gaq.push(['ascot._trackEvent', 'Plugin', 'loaded', $(location).attr('href')]);
  });

  var plugin = new AscotPlugin(tagSourceUrl);
  var hashParams = plugin.parseHashParams($(location).attr('href'));
  var jsonp = function(url, callback) {
    $.ajax({
      type: 'GET',
      url: url,
      async: true,
      jsonpCallback: 'callback',
      contentType: 'application/jsonp',
      dataType: 'jsonp',
      success : function(json) {
        callback(json);
      }
    });
  };

  var ascotUpvoteLook = function(UI, upvoteButton, ascotId) {
    UI.handleUpvoteLook(jsonp, upvoteButton, ascotId);
  };
  
  var makeOverlay = function(image, ascotId, url, json) {
    if (json && json.look && json.look.tags) {
      var data = json;
      json = json.look;
      var UI = new AscotPluginUI(tagSourceUrl, $(location).attr('href'), json, plugin);

      var myViewConfig = config ||
          json.viewConfig[0] ||
          { behavior : { displayTagsOnInit : "SHOW" },
            display : { borderWidth : 3, backgroundColor : "#171717" }
          };
      var viewConfig = new AscotPluginViewConfig(myViewConfig);
      
      _gaq.push(['ascot._trackEvent', 'lookLoaded', ascotId, $(location).attr('href')]);

      var tumblrUrl = plugin.getTumblrShareUrl(json);

      var twitterUrl = plugin.getTwitterUrl("http://www.ascotproject.com/look/" + json._id);

      var iframeCode = plugin.getIframeCode(json);

      var facebookUrl = plugin.getFacebookUrl(json);
      
      var pinterestUrl = plugin.getPinterestUrl(json);

      var height = image.height();
      var width = image.width();
            
      image.wrap('<div class="ascot_overlay_look" />');
      
      var parseIntSafe = function(st) {
        var ret = parseInt(st, 10);
        if (isNaN(ret)) {
          return 0;
        }
        return ret;
      };
      
      var wrapper = image.parent();

      var marginLeft = parseIntSafe(image.css('marginLeft'));
      var marginRight = parseIntSafe(image.css('marginRight'));
      var marginTop = parseIntSafe(image.css('marginTop'));
      var marginBottom = parseIntSafe(image.css('marginBottom'));
      image.css('margin', '0px');

      var wrapperWidth = image.width() + parseIntSafe(image.css('borderLeftWidth')) + parseIntSafe(image.css('borderRightWidth'));
      var wrapperHeight = image.height() + parseIntSafe(image.css('borderTopWidth')) + parseIntSafe(image.css('borderBottomWidth'));
      var overlayDeltaX = parseIntSafe(image.css('borderLeftWidth'));
      var overlayDeltaY = parseIntSafe(image.css('borderTopWidth'));
      wrapper.css('width', wrapperWidth + 'px');
      wrapper.css('height', wrapperHeight + 'px');
      
      image.ascotPluginResizeActions = [];
      
      image.resize(function() {
        for (var i = 0; i < image.ascotPluginResizeActions.length; ++i) {
          image.ascotPluginResizeActions[i]();
        }
      });
      
      image.ascotPluginResizeActions.push(function() {
        wrapperWidth = image.width() + parseIntSafe(image.css('borderLeftWidth')) + parseIntSafe(image.css('borderRightWidth'));
        wrapperHeight = image.height() + parseIntSafe(image.css('borderTopWidth')) + parseIntSafe(image.css('borderBottomWidth'));
        
        wrapper.css('width', wrapperWidth + 'px');
        wrapper.css('height', wrapperHeight + 'px');
      });
      
      wrapper.css('marginLeft', marginLeft + 'px');
      wrapper.css('marginRight', marginRight + 'px');
      wrapper.css('marginTop', marginTop + 'px');
      wrapper.css('marginBottom', marginBottom + 'px');

      image.css('position', 'absolute');
      image.css('top', '0px');
      image.css('left', '0px');
      
      if (viewConfig.shouldShowAnimateButton()) {
        wrapper.append('<div class="ascot_overlay_animate_button"></div>');
        var animateButton = wrapper.children().last();
        animateButton.click(function(event) {
          event.preventDefault();
          overlay.toggle("slide", { direction: "left" }, 500, function(){});
        });
      }
              
      wrapper.append('<div class="ascot_overlay"></div>');
      var overlay = wrapper.children().last();
      overlay.css('width', image.width() + 'px');
      overlay.css('height', image.height() + 'px');

      image.ascotPluginResizeActions.push(function() {
        overlay.css('width', image.width() + 'px');
        overlay.css('height', image.height() + 'px');
        
        var overlayDeltaX = parseIntSafe(image.css('borderLeftWidth'));
        var overlayDeltaY = parseIntSafe(image.css('borderTopWidth'));
        overlay.css('left', overlayDeltaX + 'px');
        overlay.css('top', overlayDeltaY + 'px');
      });
      
      overlay.css('left', overlayDeltaX + 'px');
      overlay.css('top', overlayDeltaY + 'px');
      overlay.append('<div class="ascot_overlay_menu_wrapper"></div>');

      if (viewConfig.shouldShowTagsOnMouseover()) {
        overlay.hide();
        wrapper.mouseenter(function(event) {
          overlay.show();
        });
        wrapper.mouseleave(function(event) {
          overlay.hide();
        });
      }

      var menuWrapper = overlay.children().last();

      var iframeDisplay = UI.createIframeDisplay(menuWrapper, iframeCode);
      iframeDisplay.hide();
      iframeDisplay.click(function(event) {
        event.preventDefault();
      });

      var htmlCodeDisplay = UI.createEmailDisplay(menuWrapper, plugin.getImageMap(json));
      htmlCodeDisplay.hide();
      htmlCodeDisplay.click(function(event) {
        event.preventDefault();
      });

      var shareMenu = UI.createShareMenu(menuWrapper, tumblrUrl, twitterUrl, facebookUrl, pinterestUrl);
      shareMenu.hide();
      var embedItem = shareMenu.children('ul').first().children('li.embedLink').first();
      embedItem.click(function(event) {
        event.preventDefault();
        iframeDisplay.toggle();
      });
      var emailItem = shareMenu.children('ul').first().children('li.embedLink').last();
      emailItem.click(function(event) {
        event.preventDefault();
        htmlCodeDisplay.toggle();
      });

      var imageMenu = UI.createImageMenu(menuWrapper);
      var shareButton = imageMenu.children().first();
      shareButton.click(function(event) {
        event.preventDefault();
        iframeDisplay.hide();
        htmlCodeDisplay.hide();
        shareMenu.fadeToggle();
      });
      var upvoteButton = imageMenu.children().last().children().first();
      upvoteButton.click(function(event) {
        event.preventDefault();
        ascotUpvoteLook(UI, upvoteButton, ascotId);
      });

      imageMenu.css('transform', 'scale(' + viewConfig.scaleFactor() + ',' + viewConfig.scaleFactor() + ')');

      if (data.hasUpvotedCookie) {
        $(upvoteButton).attr('src', tagSourceUrl + '/images/overlayOptions_heart_small_opaque.png');
        $(upvoteButton).css('cursor', 'pointer');
        $(upvoteButton).css('opacity', '1');
      }

      if (json.source &&
          json.source.length > 0 &&
          viewConfig.shouldShowSourceTag()) {
        var sourceTag = UI.createSourceTag(overlay);
        var sourceUrl = sourceTag.children().last();

        sourceTag.css('transform', 'scale(' + viewConfig.scaleFactor() + ',' + viewConfig.scaleFactor() + ')');
        sourceTag.css('borderWidth', viewConfig.getBorderWidth());
        sourceTag.css('backgroundColor', viewConfig.getBackgroundColor());

        sourceTag.hover(function() {
          sourceUrl.show(100, function(){});
        }, function() {
          sourceUrl.hide(100, function(){});
        }, 250);
      }
      
      var corners = { upperLeft : false, upperRight : false, bottomRight : false, bottomLeft : false };
      $.each(json.tags, function(i, tag) {
        var tagContainer = $("<div class='ascot_overlay_tag_container'></div>");
        var pluginTag = new AscotPluginTag(json.size, tag.position, tag.product);
        var tagPositionData = UI.constructTagContainer(overlay, tagContainer, { height : height, width : width }, pluginTag);
        var tagPosition = tagPositionData.position;

        if (tagPositionData.corners.bottomLeft) {
          sourceTag.css('top', '0px');
          sourceTag.css('bottom', '');
        }

        var tagName =
            $("<div class='ascot_overlay_tag_name'>" + tag.index + "</div>");
        tagName.appendTo(tagContainer);
        tagName.css('borderWidth', viewConfig.getBorderWidth());
        tagName.css('backgroundColor', viewConfig.getBackgroundColor());
                
        var tagDescription = $("<div class='ascot_overlay_tag_description'></div>");
        UI.constructTagDescription(height, width, tagContainer, tagDescription, tag, tagPosition);

        if (hashParams.ascotPopout &&
            hashParams.ascotPopout.indexOf(ascotId) != -1 &&
            hashParams.ascotPopout.indexOf('_' + (tag.index)) != -1) {
          tagContainer.css('z-index', 5);
          tagDescription.show();
        }

        tagContainer.css('transform', 'scale(' + viewConfig.scaleFactor() + ',' + viewConfig.scaleFactor() + ')');
                
        tagContainer.hover(function() {
          tagContainer.css('z-index', 5);
          tagDescription.show(100, function(){});
        },function(){
          tagContainer.css('z-index', 0);
          tagDescription.hide(100, function(){});
        }, 250);

        image.ascotPluginResizeActions.push(function() {
          tagPosition = UI.constructTagContainer(overlay, tagContainer, { height : image.height(), width : image.width() }, pluginTag);
        });

        if (window.Hammer) {
          var s = false;
          window.Hammer(tagContainer).on('tap', function(event) {
            if (!s) {
              tagContainer.css('z-index', 5);
              tagDescription.show(100, function(){});
              s = true;
            } else {
              tagContainer.css('z-index', 0);
              tagDescription.hide(100, function(){});
              s = false;
            }
          });
        }
      });  
    }
  };
   
  // List of all images
  var ascotQueue = [];
  var done = [];
  var images = $('img').get();
  var numLoaded = 0;

  var ascotify = function() {
    // This function is recursively called when ajax/jsonp call out to
    // ascotproject.com is done - this lets us queue up requests and avoid
    // issues with browser simultaneous request limits
    if (ascotQueue.length == 0) {
      return;
    }
    var url = ascotQueue[0].attr('src').toLowerCase();
    var lookId;
    var image = ascotQueue[0];
      
    var ascotId = plugin.getAscotHashParam(url);

    // This is really only useful for Tumblr and other places which insist on
    // only showing images stored on their servers. On our end we can just use
    // the #ascot notation, so just hardcode the ascotproject.com stuff for now
    if (ascotId == null && image.parent()) {
      ascotId = plugin.getAscotIdFromParentHref(image);
    }

    if (ascotId != null) {
      var finish = function(json) {
        image.imagesLoaded(function() {
          profile.start('MAKEOVERLAY');
          makeOverlay(image, ascotId, url, json);
          profile.stop('MAKEOVERLAY');
          if (++numLoaded >= images.length) {
            if (usePIE && window.PIE) {
              $('.ascot_overlay_tag_name').each(function() {
                window.PIE.attach(this);
              });
            }
          }
        });

        ascotQueue.shift();
        done.push(image);
        ascotify();
      };

      profile.start('CALLOUT');
      if (lookCache[ascotId]) {
        finish(lookCache[ascotId]);
      } else {
        jsonp(
            tagSourceUrl + '/tags.jsonp?id=' + encodeURIComponent(ascotId),
            function (json) {
              profile.stop('CALLOUT');
              // Now that we know that our jsonp call is done, we can wait for our
              // image to load to make our overlay, and then go to the next image in
              // our 'queue'
              finish(json);
            });
      }
    } else {
      ascotQueue.shift();
      ascotify();
    }
  };

  window.ascotPluginEnqueue = function(image) {
    if (image in ascotQueue || image in done) {
      return;
    }
    ascotQueue.push(image);

    if (ascotQueue.length == 1) {
      ascotify();
    }
  };

  for (var i = 0; i < images.length; ++i) {
    window.ascotPluginEnqueue($(images[i]));
  }

  ret.setDataForLook = function(id, data) {
    lookCache[id] = data;
  };
  ret.resizeAll = function() {
    for (var i = 0; i < done.length; ++i) {
      if (done[i].ascotPluginResizeActions) {
        for (var j = 0; j < done[i].ascotPluginResizeActions.length; ++j) {
          done[i].ascotPluginResizeActions[j]();
        }
      }
    }
  };
  ret.killOverlay = function(image) {
    if ($(image.parent()).hasClass('ascot_overlay_look')) {
      $(image.parent()).children('.ascot_overlay').remove();
      $(image).css('position', 'relative');
      $(image).css('marginTop', $(image.parent()).css('marginTop'));
      $(image).css('marginBottom', $(image.parent()).css('marginBottom'));
      $(image).css('marginLeft', $(image.parent()).css('marginLeft'));
      $(image).css('marginRight', $(image.parent()).css('marginRight'));
      $(image).unwrap();
    }
  };
  ret.makeOverlay = function(image, ascotId, url, json) {
    makeOverlay(image, ascotId, url, json);
  };
  return ret;
};
