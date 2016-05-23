/*  Calculators of statistical significance for polls
 *   Jose Luis Blanco (C) 2012
 *
 *   For http://www.ciencia-explicada.com/
 *   Contact: blog.ciencia.explicada@gmail.com
 *
 *  Released under GNU GPL3
 */

/** ======= CALC 1 ======= 
  *  Std dev. of one poll result
  */
function calc1_one_choice_std(myform)
{
	var p = Number( fix_decimales(myform.p.value) );
	var N = Number( myform.N.value );
	var q = Number( fix_decimales(myform.q.value) );

	var s = Math.sqrt(p*(100-p)/(N-1));
	var CI = s*q;
	myform.std.value = s.toFixed(3);
	myform.CI.value = "\u00B1" + CI.toFixed(3)+'%';
}

/** ======= CALC 2 ======= 
  *  Significance of a difference
  */
function calc2(myform)
{
	var N = Number( myform.N.value );
	var pa = Number( fix_decimales(myform.pa.value) );
	var pb = Number( fix_decimales(myform.pb.value) );

	var dif = Math.abs(pa-pb);
	var std_dif = Math.sqrt( ( 100*(pa+pb) - (pa-pb)*(pa-pb) )/(N-1));
	var dif_sigmas = dif/std_dif;
	var chi2cdf = chi2CDF(1,Math.pow(dif_sigmas,2));

	var lang = myform.lang.value;

	myform.dif.value = dif.toFixed(2)+'%';
	myform.std.value = std_dif.toFixed(2);
	myform.dif_sigmas.value = dif_sigmas.toFixed(3) + "\u03C3"
	myform.chi2.value = (100*chi2cdf).toFixed(3)+'% '+ explain_significance(dif_sigmas, lang);
}

/** ======= CALC 3 ======= 
  *  Significance of a difference between diferent polls
  */
function calc3(myform)
{
	var Na = Number( myform.Na.value );
	var Nb = Number( myform.Nb.value );
	var pa = Number( fix_decimales(myform.pa.value) );
	var pb = Number( fix_decimales(myform.pb.value) );

	var dif = Math.abs(pa-pb);
	var std_dif = Math.sqrt( pa*(100-pa)/Na + pb*(100-pb)/Nb );
	var dif_sigmas = dif/std_dif;
	var chi2cdf = chi2CDF(1,Math.pow(dif_sigmas,2));

	var lang = myform.lang.value;

	myform.dif.value = dif.toFixed(2)+'%';
	myform.std.value = std_dif.toFixed(2);
	myform.dif_sigmas.value = dif_sigmas.toFixed(3) + "\u03C3"
	myform.chi2.value = (100*chi2cdf).toFixed(3)+'% ' + explain_significance(dif_sigmas, lang);
}

function explain_significance(nsigmas, lang)
{
	if (nsigmas<2) 
		return lang=="es" ? "-> NO es significativo" : "-> it is NOT significant";
	else if (nsigmas<4) 
		return lang=="es" ? "-> ES significativo" : "-> it IS significant";
	else return lang=="es" ? "-> es MUY significativo" : "-> it IS VERY significant";
}

function fix_decimales(s)
{
	return s.replace(',','.');
}

function chi2CDF(degreesOfFreedom, arg)
{
	return noncentralChi2CDF(degreesOfFreedom, 0.0, arg);
}
function noncentralChi2CDF(degreesOfFreedom, noncentrality, arg)
{
	var a = degreesOfFreedom + noncentrality;
	var b = (a + noncentrality) / (a*a);
	var t = (Math.pow(arg/a, 1.0/3.0) - (1.0 - 2.0/9.0 * b) )/Math.sqrt(2.0/9.0 * b);
	return 0.5*(1.0 + erf(t/Math.sqrt(2.0)));
}


// These are from: http://statpages.org/scicalc.html

function GAUSS(z) { return ( (z<0) ? ( (z<-10) ? 0 : CHISQ(z*z,1)/2 ) : ( (z>10) ? 1 : 1-CHISQ(z*z,1)/2 ) ) }
function erf(z) { return ( (z<0) ? (2*GAUSS(Math.sqrt(2)*z)-1) : (1-2*GAUSS(-Math.sqrt(2)*z)) ) }

var PI=Math.PI; var PID2=PI/2; var DEG=180/PI;

function ABS(x) { return Math.abs(x) }
function SQRT(x) { return Math.sqrt(x) }
function EXP(x) { return Math.exp(x) }

function NORM(z) { var q=z*z
if(ABS(z)>7) {return (1-1/q+3/(q*q))*EXP(-q/2)/(ABS(z)*SQRT(PID2))} else {return CHISQ(q,1) }
}

function CHISQ(x,n) 
{
	if(x>1000 | n>1000) 
	{ 
		var q=NORM((POWER(x/n,1/3)+2/(9*n)-1)/SQRT(2/(9*n)))/2; 
		if (x>n) 
		{return q}
		{return 1-q} 
	}
	var p=EXP(-0.5*x); if((n%2)==1) { p=p*SQRT(2*x/PI) }
	var k=n; while(k>=2) { p=p*x/k; k=k-2 }
	var t=p; var a=n; while(t>1e-15*p) { a=a+2; t=t*x/a; p=p+t }
	return 1-p
}

