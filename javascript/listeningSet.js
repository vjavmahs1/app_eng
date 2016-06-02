jQuery(document).ready(function($){

  $(".sortable").sortable({
    stop: function(event, ui){
        var cnt = 1;
        $(this).children('li').each(function(){
            $(this).children('input:first').attr('name', "l_question_asw"+cnt+"");
            cnt++;
            });
        }
  });

    var droplist = $('.drop')
    for(var i=0; i<droplist.length; i++){
      (function(i) {
        droplist[i].addEventListener('change', function(event){
          if($('#questionType'+i).val() ==3){
            var imagelabel =$('.imagelabel')
            var imageTagGroup =$('.imageTagGroup')
            imagelabel[i].style.display="block"
            imageTagGroup[i].style.display="block"

          }else{
            var imagelabel =$('.imagelabel')
            var imageTagGroup =$('.imageTagGroup')
            console.log(imagelabel[i]);
            imagelabel[i].style.display="none"
            imageTagGroup[i].style.display="none"
          }
        })
       }(i));
    }

    $("#setEdit").click(function(e){
      var proId = $(this).data('id');
      window.location.replace("/listening/set/edit/"+proId);


    })


    //updating problem using ajax
    $('.formtags').each(function () {
      var formtag = this;
      var form = $(formtag)
      form.on('submit',(function(e){
        var formData = new FormData($(this)[0]);
        var proId = $(this).data('id');
        var url = "/listening/problem/edit/"+proId
        $.ajax({
               type: "POST",
               url: url,
               data: formData,
               cache: false,
               contentType: false,
               processData: false,
               success: function(data)
               {

                 var body = data.substring(data.indexOf("<body>")+6,data.indexOf("</body>"));
                  $('body').html(body);
                  $('.selectpicker').selectpicker('render').selectpicker('refresh');

                  $('.collapse').collapse('hide');

                 $("#edit-alert").css({'display':'block'});

                 $("#edit-alert").fadeTo(2000, 500).slideUp(500, function(){

                   $("#edit-alert").css({'display':'none'});


                 });
               }

             });

        e.preventDefault(); // avoid to execute the actual submit of the form.
      })
      )
      })




  //makeing listening problem using ajax
    // this is the id of the form
  $("#target").submit(function(e) {
    var formData = new FormData($(this)[0]);
      var proId = $(this).data('id');
      var url = proId; // the script where you handle the form input.

      $.ajax({
             type: "POST",
             url: url,
             data: formData, // serializes the form's elements.
             //for upload file in ajax
             cache: false,
             contentType: false,
             processData: false,
             success: function(data)
             {
               console.log(data);
               var body = data.substring(data.indexOf("<body>")+6,data.indexOf("</body>"));
                $('body').html(body);
                $('.selectpicker').selectpicker('render').selectpicker('refresh');


                 $('.collapse').collapse('hide');
                $("#produce-alert").css({'display':'block'});


                $("#produce-alert").fadeTo(2000, 1300).slideUp(1300, function(){
                  $("#produce-alert").css({'display':'none'});


                });

             }
           });
      e.preventDefault(); // avoid to execute the actual submit of the form.
  });



  //deleting listening problem using ajax
  $(document).on("click", "#deButton", function () {
    var proId = $(this).data('id');
      var one = document.getElementById('dele')
      one.addEventListener('click', function(){
        removeItem(proId);

      })
    });

    function removeItem(id) {
      var questionset_id = $("#questionsset_id").val();
      $.ajax({
      url:'problem/delete/'+id,
      type:"post",
      data: {id: id, questionset_id: questionset_id},

      success:function(data) {

        var body = data.substring(data.indexOf("<body>")+6,data.indexOf("</body>"));
         $('body').html(body);
         $('.selectpicker').selectpicker('render').selectpicker('refresh');

          $('.collapse').collapse('hide');
         $("#delete-alert").css({'display':'block'});


         $("#delete-alert").fadeTo(2000, 1300).slideUp(1300, function(){
           $("#delete-alert").css({'display':'none'});


         });


        }
      });
    }
  });
