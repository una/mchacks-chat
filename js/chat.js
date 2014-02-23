$(function() {
'use strict';

  var $ = window.$;
  var _ = window._;
  var goinstant = window.goinstant;

  var url = 'https://goinstant.net/una/mhacks';

  var room;
  var user;
  var messagesKey;

  var $name = $('.name');
  var $text = $('.text');
  var $messages = $('.messages');

  var connect = goinstant.connect(url);

  connect.then(function(result) {
    room = result.rooms[0];
    messagesKey = room.key('messages');

    // messagesKey.remove();

    return room.self().get();

  }).then(function(result) {
    user = result.value;
    $name.val(user.displayName);

    return messagesKey.get();

  }).then(function(result) {
    var messages = result.value;
    var ordered = _.keys(messages).sort();

    _.each(ordered, function(id) {
      addMessage(messages[id]);
    });

  }).fin(function() {
    var options = {
      local: true,
      listener: addMessage
    };

    messagesKey.on('add', options);

    $text.on('keydown', handleMessage);
    $name.on('keydown blur', handleName);
  });

  function randomColor() {
    var colorList = ['red', 'orange', 'yellow', 'green', 'blue', 'pink', 'purple'];
    var randno = Math.floor(Math.random() * colorList.length);
    return colorList[randno];
  }

  function addMessage(message) {
    var $message = $('<li><div class="user-name"></div><div class="user-message"></div></li>');
    $message.addClass('message').addClass(randomColor());

    $message.children().first().text(message.name);
    $message.children().last().text(message.text);

    $messages.append($message);

    $text.val('');
    _scrollBottom();
  }

  function handleMessage(event) {
    if (event.which !== 13) {
      return;
    }

    var message = {
      name: $name.val(),
      text: $text.val()
    };

    if (message.name === '' || message.text === '') {
      return;
    }

    //additions

    var prepend = ['much ', 'such ', 'wow ', 'cool ', 'moar ', 'omg ', 'many ', 'so '];
    var append = [' wow', ' !!!'];

    //adding prepend
    message.text = prepend[Math.floor(Math.random() * prepend.length)] + message.text;

    //appending every third message
    if ($('.messages').children().length %3 === 0) {
      message.text += append[Math.floor(Math.random() * append.length)];
    }

    //make text just say 'wow once in a while'
    if ($('.messages').children().length %15 === 0) {
      message.text = "wow.";
    }

    //on new sentances, prepend things still :)
    if (message.text.indexOf(". ") != -1) {
        message.text = message.text.replace(". ", '. ' + prepend[Math.floor(Math.random() * prepend.length)]);
    }

    messagesKey.add(message);
  }

  function handleName(event) {
    if (event.which !== 13 && event.type === 'keydown')  {
      return;
    }

    var name = $name.val();

    if (user.displayName === name) {
      return;
    }

    room.self().key('displayName').set(name);
    user.displayName = name;
  }

  function scrollBottom() {
    var properties = {
      scrollTop: $messages[0].scrollHeight
    };

    $messages.animate(properties, 'slow');
  }

  var _scrollBottom = _.debounce(scrollBottom, 100);
});
