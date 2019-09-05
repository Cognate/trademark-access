console.log('loading some JS');
$().ready(function() {
  console.log('jquery ready');
  $('#demo-btn').on('click', function() {
    console.log('clicked the button');
  });
});
