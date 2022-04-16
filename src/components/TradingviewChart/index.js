import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { createChart } from 'lightweight-charts';
import React, { useState, useEffect, useRef, memo } from 'react';
import isEqual from 'react-fast-compare';
import { Play } from 'react-feather';
import { usePrevious } from 'react-use';
import styled from 'styled-components';

import { IconWrapper } from '..';
import { useDarkModeManager } from '../../contexts/LocalStorage';
import { formattedNum } from '../../utils';

dayjs.extend(utc);

const removeNode = (type) => {
  // remove the tooltip element
  let tooltip = document.getElementById('tooltip-id' + type);
  let node = document.getElementById('test-id' + type);
  try {
    node.removeChild(tooltip);
  } catch (e) {
    console.log(e);
  }
};

export const CHART_TYPES = {
  BAR: 'BAR',
  AREA: 'AREA',
};

const Wrapper = styled.div`
  position: relative;
`;

// constant height for charts
const HEIGHT = 300;

const TradingViewChart = ({
  type = CHART_TYPES.BAR,
  data,
  base,
  baseChange,
  field,
  title,
  width,
  useWeekly = false,
}) => {
  // reference for DOM element to create with chart
  const ref = useRef();

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false);
  const dataPrev = usePrevious(data);

  useEffect(() => {
    if (data !== dataPrev && chartCreated && type === CHART_TYPES.BAR) {
      removeNode(type);
      chartCreated.resize(0, 0);
      setChartCreated();
    }
  }, [chartCreated, data, dataPrev, type]);

  // parese the data and format for tardingview consumption
  const formattedData = data?.map((entry) => {
    return {
      time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
      value: parseFloat(entry[field]),
    };
  });

  // adjust the scale based on the type of chart
  const topScale = type === CHART_TYPES.AREA ? 0.32 : 0.2;

  const [darkMode] = useDarkModeManager();
  const textColor = darkMode ? 'white' : 'black';
  const previousTheme = usePrevious(darkMode);
  const previousBase = usePrevious(base);

  // reset the chart if them switches
  useEffect(() => {
    const reset = () => {
      // remove the tooltip element
      removeNode(type);
      chartCreated.resize(0, 0);
      setChartCreated();
    };
    if ((chartCreated && previousTheme !== darkMode) || (chartCreated && previousBase !== base)) {
      reset();
    }
  }, [chartCreated, darkMode, previousTheme, type, previousBase, base]);

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedData) {
      var chart = createChart(ref.current, {
        width: width,
        height: HEIGHT,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        rightPriceScale: {
          scaleMargins: {
            top: topScale,
            bottom: 0,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
        grid: {
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false,
          },
        },
        localization: {
          priceFormatter: (val) => formattedNum(val, true),
        },
      });

      var series =
        type === CHART_TYPES.BAR
          ? chart.addHistogramSeries({
              color: '#4526A2',
              priceFormat: {
                type: 'volume',
              },
              scaleMargins: {
                top: 0.32,
                bottom: 0,
              },
              lineColor: '#4526A2',
              lineWidth: 3,
            })
          : chart.addAreaSeries({
              topColor: '#4526A2',
              bottomColor: 'rgba(69, 38, 162, 0)',
              lineColor: '#4526A2',
              lineWidth: 3,
            });

      series.setData(formattedData);
      var toolTip = document.createElement('div');
      toolTip.setAttribute('id', 'tooltip-id' + type);
      toolTip.className = darkMode ? 'three-line-legend-dark' : 'three-line-legend';
      ref.current.appendChild(toolTip);
      toolTip.style.display = 'block';
      toolTip.style.fontWeight = '500';
      toolTip.style.left = -4 + 'px';
      toolTip.style.top = '-' + 8 + 'px';
      toolTip.style.backgroundColor = 'transparent';

      // format numbers
      let percentChange = baseChange?.toFixed(2);
      let formattedPercentChange = percentChange ? (percentChange > 0 ? '+' : '') + percentChange + '%' : '0%';
      let color = percentChange >= 0 ? 'green' : 'red';

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML = `
        <div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">
        ${title} 
        ${type === CHART_TYPES.BAR && !useWeekly ? '(24hr)' : ''}
        </div>
          <div style="font-size: 22px; margin: 4px 0px; color:${textColor}; display: flex; align-items: center; align-content: center;" >
          ${
            base
              ? formattedNum(base ?? 0, true)
              : `<div style="width: 35px; margin-left: 16px"><div class="dot-flashing"></div></div>`
          }
          <span style="margin-left: 10px; font-size: 16px; color: ${color};">${formattedPercentChange}</span>
          </div>`;
      }
      setLastBarText();

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > HEIGHT
        ) {
          setLastBarText();
        } else {
          let dateStr = useWeekly
            ? dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
                .startOf('week')
                .format('MMMM D, YYYY') +
              '-' +
              dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
                .endOf('week')
                .format('MMMM D, YYYY')
            : dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format('MMMM D, YYYY');
          var price = param.seriesPrices.get(series);

          toolTip.innerHTML = `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title}</div>
            <div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">
            ${formattedNum(price, true)}
           
            </div>
            <div>
            ${dateStr}
            </div>`;
        }
      });

      chart.timeScale().fitContent();

      setChartCreated(chart);
    }
  }, [
    base,
    baseChange,
    chartCreated,
    darkMode,
    data,
    formattedData,
    textColor,
    title,
    topScale,
    type,
    useWeekly,
    width,
  ]);

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT);
      chartCreated && chartCreated.timeScale().scrollToPosition(0);
    }
  }, [chartCreated, width]);

  return (
    <Wrapper>
      <div ref={ref} id={'test-id' + type} />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent();
          }}
        />
      </IconWrapper>
    </Wrapper>
  );
};

export default memo(TradingViewChart, isEqual);
