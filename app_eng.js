var express =  require('express');
var bodyParser = require('body-parser');
var app = express();

var mysql = require('mysql');
//파일 업로드 미들웨어
var multer = require('multer');

//파일 저장경로 지정


var l_storage = multer.diskStorage({

  destination: function (req, file, cb) {
    {
      cb(null, 'problem_file/image/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var l_set_storage = multer.diskStorage({

  destination: function (req, file, cb) {
    {
        cb(null, 'problem_file/mp3/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});


var l_set_upload = multer({ storage: l_set_storage});
var l_upload = multer({ storage: l_storage});


//mysql연결
var conn = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : '900620zZ.',
  database : 'eng'
});
conn.connect();

//파일 유알엘로 쓸때 쓰는것
app.use('/problem_file',express.static('problem_file'));
app.use('/javascript',express.static('javascript'));
app.use('/css',express.static('css'));


app.use(bodyParser.urlencoded({ extended: false }))

//제이드 소스 틀에 맞쳐보여주는것
app.locals.pretty = true;

//뷰 저장경로 지정
app.set('views', './views');
//엔진 템플렛 설정
app.set('view engine', 'jade');


app.get('/listening/set/new', function(req, res){
  var sql = 'select*from l_questionset';
  conn.query(sql, function(err, l_questionsets){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('listening_set_new',{l_questionsets:l_questionsets});

  })



});


app.post('/listening/set/new', l_set_upload.single('l_userfile_audio'), function(req, res, next){
  var l_questionset_name = req.body.l_questionset_name;
  var l_questionset_audiopath = "http://localhost:2000/"+req.file.path;
  Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
 };

  date = new Date();
    var now = date.yyyymmdd();


  var sql = 'INSERT into `l_questionset` (`l_questionset_name`, `l_questionset_date`, `l_questionset_audiopath`) VALUES(?,?,?)';
  conn.query(sql,[l_questionset_name, now ,l_questionset_audiopath], function(err, rows){
    if(err){
      console.log(err);
     res.status(500).send('Internal Server Error');
   }else{
     res.redirect('/listening/set/'+rows.insertId);

   }
  })

});

app.get('/listening/set', function(req, res){
  var sql = 'select*from l_questionset order by `l_questionset_id` desc';
  conn.query(sql, function(err, l_questionsets){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('listening_set',{l_questionsets:l_questionsets});

  })

})

app.post('/listening/set/delete', function(req, res){
  var target_id = req.body.id
  var sql = 'Delete from l_questionset WHERE l_questionset_id = ?'
  conn.query(sql,[target_id], function(err, result){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else{
        res.redirect('/listening/set');

    }
  });
})

app.get('/listening/set/edit/:id', function(req, res){
  var sql = 'select* from l_questionset where l_questionset_id = ?'
  var id = req.params.id;
  conn.query(sql,[id], function(err, l_questionsets){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else{
      res.render('listening_set_edit',{l_questionset:l_questionsets[0]});
    }
  })

})

app.post('/listening/set/edit/:id', l_set_upload.single('l_userfile_audio'), function(req, res, next){
  var l_questionset_name = req.body.l_questionset_name;
  var l_questionset_id = req.body.l_questionset_id;
  var id = req.params.id;
  if(req.file != null){
    var l_questionset_audiopath = "http://localhost:2000/"+req.file.path;
    var sql = 'UPDATE `l_questionset` SET `l_questionset_name` =?, l_questionset_audiopath =? where l_questionset_id = ? '
    conn.query(sql,[l_questionset_name, l_questionset_audiopath, id], function(err, rows){
        if(err){
          console.log(err);
         res.status(500).send('Internal Server Error');
       }else{
         console.log(rows);
         res.redirect('/listening/set/'+l_questionset_id);

        }
      })
  }else{
    var sql = 'UPDATE `l_questionset` SET `l_questionset_name` =? where l_questionset_id = ? '
    conn.query(sql,[l_questionset_name, id], function(err, rows){
      if(err){
        console.log(err);
       res.status(500).send('Internal Server Error');
     }else{
       console.log(rows);
       res.redirect('/listening/set/'+l_questionset_id);

      }
      })

  }
})

app.get('/listening/set/:id', function(req, res){
  var sql =  'select* from l_questionset where l_questionset_id = ?'
  var id = req.params.id;
  conn.query(sql,[id], function(err, l_questionsets){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else{
      var sql ='SELECT*FROM l_questiontype';
      conn.query(sql, function(err, l_questiontypes){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else{
          var sql ='SELECT*FROM l_question where l_questionset_id = ' + id
          conn.query(sql, function(err, l_questions){
            if(err){
              console.log(err);
              res.status(500).send('Internal Server Error');
            } else{
              res.render('listening_set_problem',{l_questionset:l_questionsets[0], l_questiontypes:l_questiontypes, l_questions : l_questions});

            }
          })

        }
      })

    }
  })
})

app.post('/listening/set/:id',l_set_upload.single('l_userfile_image'), function(req, res, next){
  var l_questionset_id = req.params.id;
  var l_questiontype_id = req.body.l_questiontype_id;
  var l_question_topic = req.body.l_question_topic;
  if(l_questiontype_id == 3){
    var l_question_imagepath = "http://localhost:2000/"+req.file.path;
  }
  var l_question_asw1 = req.body.l_question_asw1;
  var l_question_asw2 = req.body.l_question_asw2;
  var l_question_asw3 = req.body.l_question_asw3;
  var l_question_asw4 = req.body.l_question_asw4;
  var l_question_asw5 = req.body.l_question_asw5;
  var l_question_solution = req.body.l_question_solution;
  var l_question_explain = req.body.l_question_explain

  var sql ='INSERT INTO `l_question`(`l_questionset_id`, `l_questiontype_id`,`l_question_topic`, `l_question_imagepath`,`l_question_asw1`,' +
  ' `l_question_asw2`,`l_question_asw3`,`l_question_asw4`,`l_question_asw5`,`l_question_solution`,`l_question_explain`) VALUES(?,?,?,?,?,?,?,?,?,?,?);'
  conn.query(sql, [l_questionset_id,l_questiontype_id,l_question_topic,l_question_imagepath,l_question_asw1,l_question_asw2,l_question_asw3,l_question_asw4,l_question_asw5,l_question_solution, l_question_explain],function(err, rows){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');

    }else{
      res.redirect('/listening/set/'+l_questionset_id);

    }
  })

})

app.post('/listening/problem/edit/:id',l_set_upload.single('l_userfile_image'), function(req, res, next){
  var l_questionset_id = req.body.l_questionset_id
  var l_question_id = req.params.id;
  var l_questiontype_id = req.body.l_questiontype_id;
  var l_question_topic = req.body.l_question_topic;
  var l_question_asw1 = req.body.l_question_asw1;
  var l_question_asw2 = req.body.l_question_asw2;
  var l_question_asw3 = req.body.l_question_asw3;
  var l_question_asw4 = req.body.l_question_asw4;
  var l_question_asw5 = req.body.l_question_asw5;
  var l_question_solution = req.body.l_question_solution;
  var l_question_explain = req.body.l_question_explain

  if(req.file != null && l_questiontype_id ==3){
    var l_question_imagepath = "http://localhost:2000/"+req.file.path;
  }

  if(l_question_imagepath != null){
    var sql = 'UPDATE `l_question` SET `l_questiontype_id`=?,`l_question_topic`=?,`l_question_imagepath`=?,l_question_asw1 =?,'
      +'`l_question_asw2`=?,`l_question_asw3`=?,`l_question_asw4`=?,`l_question_asw5`=?,`l_question_solution` =?,`l_question_explain`=? WHERE l_question_id = ?';
    conn.query(sql, [l_questiontype_id,l_question_topic,l_question_imagepath,l_question_asw1,l_question_asw2,l_question_asw3,
              l_question_asw4,l_question_asw5,l_question_solution,l_question_explain, l_question_id], function(err, rows){
                if(err){
                  console.log(err);
                 res.status(500).send('Internal Server Error');
               }else{
                 res.redirect('/listening/set/'+l_questionset_id)
               }

              })

  }else{
    var sql = 'UPDATE `l_question` SET `l_questiontype_id`=?,`l_question_topic`=?,l_question_asw1 =?,'
      +'`l_question_asw2`=?,`l_question_asw3`=?,`l_question_asw4`=?,`l_question_asw5`=?,`l_question_solution` =?,`l_question_explain`=? WHERE l_question_id = ?';
    conn.query(sql, [l_questiontype_id,l_question_topic,l_question_asw1,l_question_asw2,l_question_asw3,
              l_question_asw4,l_question_asw5,l_question_solution,l_question_explain, l_question_id], function(err, rows){
                if(err){
                  console.log(err);
                 res.status(500).send('Internal Server Error');
               }else{
                 res.redirect('/listening/set/'+l_questionset_id)
               }

              })

  }

})

app.post('/listening/set/problem/delete/:id', function(req, res){
  var target_id = req.params.id;
  var l_questionset_id = req.body.questionset_id
  var sql = 'Delete from l_question WHERE l_question_id = ?'
  conn.query(sql,[target_id], function(err, result){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');

    }else{
      res.redirect('/listening/set/'+l_questionset_id)

    }
  });
})





//(localhost:2000/reaindg/new 연결)
app.get('/reading/new', function(req, res){
  //reading/new에 보내줄 데이터 뽑는 query문 결과는
    var sql ='SELECT*FROM r_questiontype';
                                    //이쪽으로 들어옴
    conn.query(sql, function(err, r_questiontypes){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
      //reading_new라는 제이드파일을 뛰어주고 r_questiontypes 변수 프론트페이지로 전달
    res.render('reading_new',{r_questiontypes:r_questiontypes});


  });
});


app.post('/reading/new', function(req,res){
  var r_questiontype_id = req.body.r_questiontype_id;
  var r_question_topic = req.body.r_question_topic;
  var r_question_text = req.body.r_question_text;
  var r_question_asw1 = req.body.r_question_asw1;
  var r_question_asw2 = req.body.r_question_asw2;
  var r_question_asw3 = req.body.r_question_asw3;
  var r_question_asw4 = req.body.r_question_asw4;
  var r_question_asw5 = req.body.r_question_asw5;
  var r_question_solution = req.body.asws;
  var r_question_trans = req.body.r_question_trans;
  var r_question_explain = req.body.r_question_explain;
  var sql = 'INSERT INTO `r_question`(`r_questiontype_id`,`r_question_topic`,`r_question_text`,`r_question_asw1`,'+
    '`r_question_asw2`,`r_question_asw3`,`r_question_asw4`,`r_question_asw5`,r_question_solution,r_question_trans,r_question_explain) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
  conn.query(sql,[r_questiontype_id,r_question_topic,r_question_text,r_question_asw1,r_question_asw2,r_question_asw3,
            r_question_asw4,r_question_asw5,r_question_solution,r_question_trans,r_question_explain],function(err, rows){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');


      } else {
        res.redirect('/reading');

      }

    });

  });
  app.get(['/reading/:id/edit'], function(req,res){
    var sql = 'Select * from r_questiontype'
    conn.query(sql, function(err, r_questiontypes){
      var id = req.params.id;
      if(id){
        var sql = 'Select s.`r_questiontype_type`, l.r_question_id, l.`r_question_topic`, l.`r_question_text`, l.`r_question_asw1`,'+
        ' l.`r_question_asw2`, l.`r_question_asw3`, l.`r_question_asw4`, l.`r_question_asw5`, l.r_question_solution, l.r_question_trans, l.r_question_explain from'+
         '`r_questiontype` as s inner join `r_question` as l ON s.`r_questiontype_id` = l.`r_questiontype_id` WHERE l.r_question_id =?';
         conn.query(sql,[id], function(err, r_question){
           if(err){
             console.log(err);
             res.status(500).send('Internal Server Error');
           } else{
             res.render('reading_edit',{r_questiontypes:r_questiontypes, r_question:r_question[0]});
            //res.send(r_question);
           }
         })
      } else {
        console.log('there is no id');
        res.status(500).send('Internal Server Error');
      }
    });

  });
  app.post(['/reading/:id/edit'], function(req,res){
    var r_questiontype_id = req.body.r_questiontype_id;
    var r_question_topic = req.body.r_question_topic;
    var r_question_text = req.body.r_question_text;
    var r_question_asw1 = req.body.r_question_asw1;
    var r_question_asw2 = req.body.r_question_asw2;
    var r_question_asw3 = req.body.r_question_asw3;
    var r_question_asw4 = req.body.r_question_asw4;
    var r_question_asw5 = req.body.r_question_asw5;
    var r_question_solution = req.body.asws;
    var r_question_trans = req.body.r_question_trans;
    var r_question_explain = req.body.r_question_explain;
    var id =req.params.id
    var sql = 'UPDATE r_question SET `r_questiontype_id`=?,`r_question_topic`=?,`r_question_text`=?,`r_question_asw1`=?, '+
    '`r_question_asw2`=?,`r_question_asw3`=?,`r_question_asw4`=?,`r_question_asw5`=?, `r_question_solution`=?, `r_question_trans`=?, `r_question_explain`=? WHERE r_question_id = ?';
    conn.query(sql,[r_questiontype_id,r_question_topic,r_question_text,r_question_asw1,r_question_asw2,r_question_asw3,
      r_question_asw4,r_question_asw5,r_question_solution,r_question_trans, r_question_explain,id], function(err, result){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else{

          res.redirect('/reading/'+r_questiontype_id);
          //res.send(result);
      }
    });
  });

  app.post(['/reading/:id/delete'], function(req,res){

    var id =req.params.id
    var sql = 'Delete from r_question WHERE r_question_id = ?'
    conn.query(sql,[id], function(err, result){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else{
          res.redirect('/reading');

      }
    });
  });

app.post(['/reading/promake','/reading/promake/:id'], function(req, res){
  var startfrom = req.body.datBastStart
  var id = req.params.id;
  console.log(startfrom);
  var extend =  3;
  if(id){
    var sql ='Select s.`r_questiontype_type`, l.r_question_id, l.`r_question_topic`, l.`r_question_text`, l.`r_question_asw1`,'+
    ' l.`r_question_asw2`, l.`r_question_asw3`, l.`r_question_asw4`, l.`r_question_asw5` from'+
     '`r_questiontype` as s inner join `r_question` as l ON s.`r_questiontype_id` = l.`r_questiontype_id` WHERE s.r_questiontype_id =? order by l.`r_question_id` desc limit ' +startfrom+ ',' + extend + '';
     conn.query(sql,[id], function(err, r_questions){
       if(err){
         console.log(err);
         res.status(500).send('Internal Server Error');
       } else{
         res.render('r_promake',{r_questions:r_questions});

       }
     })
  }else{
      var sql ='Select s.`r_questiontype_type`, l.r_question_id, l.`r_question_topic`, l.`r_question_text`, l.`r_question_asw1`,'+
  ' l.`r_question_asw2`, l.`r_question_asw3`, l.`r_question_asw4`, l.`r_question_asw5` from'+
   '`r_questiontype` as s inner join `r_question` as l ON s.`r_questiontype_id` = l.`r_questiontype_id` order by l.`r_question_id` desc LIMIT '+startfrom+ ',' + extend + '';
   conn.query(sql, function(err, r_questions){
     if(err){
       console.log(err);
       res.status(500).send('Internal Server Error');
     } else{
       res.render('r_promake',{r_questions:r_questions});

     }
   })

}
 })


app.get(['/reading','/reading/:id'], function(req,res){
  var sql = 'Select * from r_questiontype'
  conn.query(sql, function(err, r_questiontypes){
    var id = req.params.id;
    if(id){
      var sql ='Select s.`r_questiontype_type`, l.r_question_id, l.`r_question_topic`, l.`r_question_text`, l.`r_question_asw1`,'+
      ' l.`r_question_asw2`, l.`r_question_asw3`, l.`r_question_asw4`, l.`r_question_asw5` from'+
       '`r_questiontype` as s inner join `r_question` as l ON s.`r_questiontype_id` = l.`r_questiontype_id` WHERE s.r_questiontype_id =? order by l.`r_question_id` desc limit 3';
       conn.query(sql,[id], function(err, r_questions){
         if(err){
           console.log(err);
           res.status(500).send('Internal Server Error');
         } else{
           res.render('reading',{r_questiontypes:r_questiontypes, r_questions:r_questions});

         }
       })
    } else {
      var sql = 'Select s.`r_questiontype_type`, l.`r_question_id`, l.`r_question_topic`, l.`r_question_text`, l.`r_question_asw1`,'+
      'l.`r_question_asw2`, l.`r_question_asw3`, l.`r_question_asw4`, l.`r_question_asw5` from'+
      '`r_questiontype` as s inner join `r_question` as l ON s.`r_questiontype_id` = l.`r_questiontype_id` order by l.`r_question_id` desc limit 3 ';
      conn.query(sql, function(err, r_questions) {
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          res.render('reading',{r_questiontypes:r_questiontypes, r_questions:r_questions});
          res.send('관리')

        }
      })

    }
  });

});


app.listen(2000, function(){
  console.log('Connected, 2000 port!');
})
