$(document).ready(function(){
    $('.answer-btn').each( function(i){
        $(this).click(()=>{
            const answer = $(this).attr('id').slice(-1);
            $.post('/get-press', {button: answer}, function (response) {
                handleResponse(response);
              });
        });
    }); 

    $("#next").click(()=>{
        location.replace(location.href);
    });

    $("#replay").click(()=>{
        location.replace("/quiz");
    });

    $("#home").click(()=>{
        location.replace("/home");
    });

    $("#new").click(()=>{
        location.replace("/");
    });

    playAudio('../sound/button-hover.wav', '.btn', 'mouseover');
});

function handleResponse(response){
    if (response.validation == false){
        $('.feedback-text').text("Wrong");
        $('.feedback-text').addClass('magenta-glow');
        $(".show-correct").show();
        $("#correct-answer").text(response.correct);
        playAudioOnce('../sound/wrong.wav');
    }else{
        $('.feedback-text').text("Correct");
        $('.feedback-text').addClass('blue-glow');
        playAudioOnce('../sound/correct.wav');
    }
    $(".row.buttons").hide();
    $("#next").show();
}

function playAudioOnce(audioPath){ 
    var audio = new Audio(audioPath);
    audio.play();
}

function playAudio(source, element, event) {
    var $audio = $(`<audio>`, {
        src: source,
        preload: 'auto'
    });

    $(element).append($audio);

    $(element).on(event, function () {
        if ($audio[0].canPlayType('audio/mpeg')) {
            $audio[0].play().catch(function (error) {
                console.error('Audio playback failed:', error);
            });
        } else {
            console.error('Audio format not supported.');
        }
    });
}