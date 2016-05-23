/*  Stats simulator for "The Million Pound Drop Live" 
 *   Jose Luis Blanco (C) 2012
 *
 *   For http://www.ciencia-explicada.com/
 *   Contact: blog.ciencia.explicada@gmail.com
 *
 *  Released under GNU GPL3
 */
document.write('<table border="0">');

var NUM_MAX_DESC = [4,  4,   4,   4,   3,   3,   3,   2];

for(var i=1;i<=8;i++)
{
	var nam     = "valor_pr_acert_desc"+i;
	var nam_des = "valor_num_desc"+i;
	
	var nams     = "sp_slider_pr_acert_desc"+i;
	var nams_des = "sp_slider_desc"+i;
	
	var def_pr  = (i<5 ? 75 : (i<8 ? 67 : 50));
	var def_des = 1; //(i<5 ? 1 : (i<8 ? 67 : 50));
	
	document.write("<tr><td>Prob. buen descarte P"+i+": <span id=\""+nam+"\">"+def_pr+"</span>% &nbsp;&nbsp; </td><td><div style=\"width:150px;\"><div id=\""+nams+"\" ></div></td> <td>&nbsp; &nbsp; Respuestas descartadas: <span id=\""+nam_des+"\">"+def_des+"</span> &nbsp;&nbsp;&nbsp; </td> <td> <div style=\"width:70px;\"> <div id=\""+nams_des+"\" ></div></div> </td> </tr>");
	
	function make_slide_func(nam)  { return ( function(event,ui) { $("#"+nam).text(ui.value.toFixed(0)); regenerate_all_plots(); } ); };
	function make_slide_func_desc(nam_des)  { return ( function(event,ui) { $("#"+nam_des).text(ui.value.toFixed(0)); regenerate_all_plots(); } ); };
	
	$("#"+nams).slider({ min:0, max:100, value:def_pr, slide: make_slide_func(nam) });
	$("#"+nams_des).slider({ min:1, max:(NUM_MAX_DESC[i-1]-1), value:def_des, slide: make_slide_func_desc(nam_des) });
}
document.write('</table>');

document.write('<table>'+
'<tr>'+
'<td> <div id="sp_placeholder_mean" style="width:300px;height:200px"></div> </td>'+
'<td> <div id="sp_placeholder_stats" style="width:300px;height:200px"></div> </td>'+
'</table>');
	
document.write('<div align="center"><p><h3>Histogramas del n&uacute;mero de fajos en cada etapa [P0:inicial, P1-P8:tras esa pregunta]</h3></p></div>');

for(var i=0;i<=8;i++)
{			
	var nam = "sp_placeholder_t"+i;
	document.write("<div id=\""+nam+"\" style=\"width:99%;height:70px\"></div>");
}

function factorial(n) 
{
	if ((n==0) || (n==1)) return 1; 
	else return n*factorial(n-1);
}	

function binopdf(k, n,p)
{
	if (k>n) return 0;
	return (factorial(n)/(factorial(k)*factorial(n-k)))*Math.pow(p,k)*Math.pow(1-p,n-k);
} 

function propagate_state(survive_prev,M, pAciertoAlDescartar, nDescartadas)
{
	if (!(nDescartadas<=M)) alert("assert(nDescartadas<=M)!! nDescartadas=" + nDescartadas + " M="+M);
	
	if (nDescartadas==0) pAciertoAlDescartar=1;
	
	var pAcierto=1.0/(M-nDescartadas);  // En cada una de las que no se han descartado
	var maxFichas=survive_prev.length-1;
	
	// Law of total probability:
	var survive_next=[];
	// Init at zeros:
	survive_next.length = maxFichas+1;
	for (var i=0;i<=maxFichas;i++) survive_next[i]=[i, 0];
	// Evaluate:
	for (var i=0;i<=maxFichas;i++)
	{
		var Pr = survive_prev[i][1];
		
		for (var j=0;j<=maxFichas;j++)
		{
			var conditional_pr = (1-pAciertoAlDescartar)*(j==0 ? 1:0) + pAciertoAlDescartar* binopdf(j,i,pAcierto);
			survive_next[j][1] += Pr * conditional_pr;
		}
	}
	return survive_next;
}

function getObjInnerText(obj) 
{
	if (document.all) // IE;
		return obj.innerText;
	else 
	{
		if (obj.textContent)
			return obj.textContent; 
		else alert("Error: This application does not support your browser.  Try again using IE or Firefox.");
	}
}

function recompute_all_histograms()
{
	var mydata = [];
	for (var i = 0; i <=8; i ++) mydata[i] = [];
	
	// Distribution for the initial state: we have 40 pieces, for sure.
	for (var j = 0; j <=40; j ++) 
		mydata[0].push([j, (j==40) ? 1:0]);
		
	var NUM_ANSWERS     = [4,  4,   4,   4,   3,   3,   3,   2];
	//var NUM_DESCARTADAS = [1,    1,    1,    1,    1,    1,    1,    1   ];

	for (var i = 1; i <=8; i ++) 
	{
		var nAnswers = NUM_ANSWERS[i-1];
		var n = "valor_pr_acert_desc"+i;
		var pAciertoAlDescartar = 0.01*Number( getObjInnerText( document.getElementById(n)) );
		
		var nd = "valor_num_desc"+i;
		var nDescartadas = Number( getObjInnerText(document.getElementById(nd)) ); 

		mydata[i] = propagate_state(mydata[i-1],nAnswers, pAciertoAlDescartar, nDescartadas);
	}

	return mydata;
}

function compute_mean_num_of_pieces(all_data)
{
	var N = all_data.length;
	var MEAN = [];
	
	for (var i=0;i<N;i++)
	{
		var M = all_data[i].length;
		var SUM=0;
		for (var j=0;j<M;j++)
			SUM+=all_data[i][j][1]*j;
		MEAN[i] = [i, SUM];
	}
	return MEAN;
}

function compute_prob_lose_all(all_data)
{
	var N = all_data.length;
	var PR_LOSE = [];
	for (var i=0;i<N;i++)
		PR_LOSE[i] = [i, all_data[i][0][1] ];
	return PR_LOSE;
}

function inverse_cdf(H, delta) 
{
	var n = H.length;
	var Xmin=0; //xs(1);
	var Xmax=n-1; //xs(end);
	
	// Expected population at each bin
	var MEAN = 0; 
	for (var i=0;i<n;i++) MEAN+=i*H[i][1];
	
	var Hc = [];
	Hc.length = n;
	Hc[0] = H[0][1];
	for (var i=1;i<n;i++)
		Hc[i] = Hc[i-1] + H[i][1];
		
	// Normalize:
	var Q=[];
	Q.length = n;
	for (var i=0;i<n;i++) {
		Hc[i]/=Hc[n-1];
		Q[i] = [i,Hc[i]];
	}
				
	// Find below/above limits:
	var idx_bel = -1;
	var idx_abo = -1;
	for (var i=0;i<n;i++)
	{
		if ((idx_bel==-1) && (Hc[i]>=delta)) idx_bel=i;
		if ((idx_abo==-1) && (Hc[i]>=(1-delta))) idx_abo=i;
	}
	
	var RET = new Object();
	RET.idx_bel = idx_bel;
	RET.idx_abo = idx_abo;
	return RET;
}

function compute_std_num_of_pieces(all_data,means)
{
	var N = all_data.length;
	var STD = [];
	
	for (var i=0;i<N;i++)
	{
		var M = all_data[i].length;
		var MED = means[i][1];
		var SUM=0;
		for (var j=0;j<M;j++)
			SUM+=all_data[i][j][1]*Math.pow( all_data[i][j][1]*j - MED, 2 );
		STD[i] = [i, Math.sqrt(SUM)];
	}
	return STD;
}

function showTooltip(x, y, contents) {
	$("<div id=\"tooltip\">" + contents + "</div>").css( {
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#fee',
		opacity: 0.80
	}).appendTo("body").fadeIn(400);
}

function myYAxisFormatter(v, axis) {
	var p = v*100;
	return p.toFixed(0) +"%";
}
function myXAxisQuestionFormatter(v, axis) {
	return "P"+v.toFixed(0);
}

	
function regenerate_all_plots() 
{
	var mydata = recompute_all_histograms();
	var MEANs = compute_mean_num_of_pieces(mydata);
	//var STDs  = compute_std_num_of_pieces(mydata,MEANs);
	var PR_LOSE = compute_prob_lose_all(mydata);
	
	var delta = 0.10;
	var CIs = [];
	CIs.length = 9;
	for (var i = 0; i < 9; i ++)
	{
		var INV_CDF_DATA = inverse_cdf( mydata[i], delta);
		CIs[i] =[i, INV_CDF_DATA.idx_abo, INV_CDF_DATA.idx_bel ];
	}

	
	// Draw mean # of pieces at each question:
	{
		var plot_mean = $.plot( sp_placeholder_mean,
			   [ 
				{ 
					data: MEANs, 
					label: "# esperado de fajos",
					lines: { show: true },
					points: { show: true }
				}, 
				{ 
					data: CIs, 
					label: "CI 80%",
					lines: { show: true, fill: true },
					points: { show: true }
				} 
				],
			   {
				   grid: { hoverable: true, clickable: true },
				   xaxis: { min:0, max: 8.5, tickFormatter: myXAxisQuestionFormatter  },
				   yaxis: { min:0, max: 41 }
				 }
				 );
				 
		$(sp_placeholder_mean).bind("plothover", function (event, pos, item) {
			if (item) {
				if (previousPoint != item.dataIndex) {
					previousPoint = item.dataIndex;
					$("#tooltip").remove();
					var x = item.datapoint[0].toFixed(2),
						y = item.datapoint[1].toFixed(4);
					showTooltip(item.pageX, item.pageY+25, Math.floor(x)+": "+y);
				}
			}
			else {
				$("#tooltip").remove();
				previousPoint = null;            
			}
		});					 
	}
	
	// Draw more stats:
	{
		var plot_stats = $.plot( sp_placeholder_stats,
			   [ 
				{ 
					data: PR_LOSE, 
					label: "Prob. perder todo",
					bars: { show: true }
				} 
				],
			   {
				   grid: { hoverable: true, clickable: true },
				   xaxis: { min:0, max: 9, tickFormatter: myXAxisQuestionFormatter  },
				   yaxis: { min:0, max: 1, tickFormatter: myYAxisFormatter },
				   legend: { position:"nw" }
				 }
				 );
				 
		$(sp_placeholder_stats).bind("plothover", function (event, pos, item) {
			if (item) {
				if (previousPoint != item.dataIndex) {
					previousPoint = item.dataIndex;
					$("#tooltip").remove();
					var x = item.datapoint[0].toFixed(2),
						y = item.datapoint[1].toFixed(4);
					showTooltip(item.pageX, item.pageY+45, "P"+Math.floor(x)+": "+(100*y).toFixed(2)+"%");
				}
			}
			else {
				$("#tooltip").remove();
				previousPoint = null;            
			}
		});					 
	}
	
	var previousPoint = null;	

	for (var i = 0; i < 9; i ++) 
	{
		var plc_name =  "#sp_placeholder_t" + i;
		
		// Find maximum and convert to percentages:
		var max_p=0;
		for (var k=0;k<mydata[i].length;k++)
		{
			if (mydata[i][k][1]>max_p) max_p = mydata[i][k][1];
		}
	
		var plot = $.plot($( plc_name ),
			   [ { data: mydata[i], label: "P"+i} ], {
				   series: {
						bars: { show: true }
				   },
				   grid: { hoverable: true, clickable: true },
				   xaxis: { min:0, max: 44 },
				   yaxis: { min:0, max: max_p, tickFormatter: myYAxisFormatter }
				 });
				 
		$(plc_name).bind("plothover", function (event, pos, item) {
			if (item) {
				if (previousPoint != item.dataIndex) {
					previousPoint = item.dataIndex;
					$("#tooltip").remove();
					var x = item.datapoint[0].toFixed(2),
						y = item.datapoint[1].toFixed(4);
					showTooltip(item.pageX, item.pageY+25, Math.floor(x)+": "+(100*y).toFixed(2)+"%");
				}
			}
			else {
				$("#tooltip").remove();
				previousPoint = null;            
			}
		});
	}
}

$(function () {
	regenerate_all_plots();
});
