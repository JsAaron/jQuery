function show(data) {
  if (!data) {
    return $("body").append('</br>')
  }
  if (typeof data === 'object') {
    for (var key in data) {
      $("body").append('<li>key->' + key + '; value->'+ data[key] +'</li>')
    }
  } else {
    $("body").append('<li>' + data + '</li>')
  }
}