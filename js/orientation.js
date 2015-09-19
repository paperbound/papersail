window.addEventListener("deviceorientation",getOrientation,true);

function getOrientation(event)
{
  var x = event.beta;
  var y = event.gamma;
  var z = event.alpha;

  if(x>90)
    x=90;
  if(x<-90)
    x=-90;

  x+=90;
  y+=90;

  return {x:x,y:y,z:z}

}
