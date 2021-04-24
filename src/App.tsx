import React, { useEffect, useRef, useState, WheelEventHandler } from 'react'
import './App.module.scss';
import styles from './App.module.scss';
import moment from 'moment'
import SimpleCanvasExample from './canva'
import { SVG } from '@svgdotjs/svg.js'
import svgPanZoom from 'svg-pan-zoom'

const startDay = '24.04.2021'
const endDay = '25.04.2021'

const startTime = `${startDay} 12:00:00:000`
const endTime = `${endDay} 12:00:00:000`

const videoSegments = [
  {
    start: `${startDay} 18:30:01.000`,
    end: `${startDay} 19:10:02.000`
  },
  {
    start: `${endDay} 00:05:01.000`,
    end: `${endDay} 03:02:02.000`
  }
]

const contextSegments = [
  {
    start: `${startDay} 14:00:01.000`,
    end: `${startDay} 14:15:02.000`
  },
  {
    start: `${startDay} 14:16:01.000`,
    end: `${startDay} 14:18:02.000`
  },
  {
    start: `${startDay} 18:00:01.000`,
    end: `${startDay} 19:15:02.000`
  },
  {
    start: `${startDay} 21:00:01.000`,
    end: `${startDay} 21:05:01.000`
  },
  {
    start: `${endDay} 00:00:01.000`,
    end: `${endDay} 03:15:02.000`
  },
  {
    start: `${endDay} 03:16:02.000`,
    end: `${endDay} 03:18:02.000`
  },
  {
    start: `${endDay} 03:18:03.000`,
    end: `${endDay} 10:18:58.000`
  }
]

export type DateAPIString = string

const API_DATE_FORMAT = 'DD.MM.YYYY HH:mm:ss.SSS'

const segmentDuration = (endSegment: DateAPIString, startSegment: DateAPIString) => {
  return moment(endSegment, API_DATE_FORMAT).valueOf() - moment(startSegment, API_DATE_FORMAT).valueOf()
}

const fullDurationVideo = segmentDuration(endTime, startTime)

const zoomIntensity = 0.010;
const MAX_SCALE = 24 * 12; // макс зум 5 мин; 12 - кол - во 5 минут в часах
const MIN_SCALE = 1.00

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null)

  const timeLineRef = useRef<HTMLDivElement>(null)
  const [slicingScaleX, setSlicingScaleX] = useState<number>(1.00)
  const [timePosition, setTimePosition] = useState<DateAPIString>('24.04.2021 23:37:02.000')
  const [wheeling, setWheeling] = useState<any>(0)

  const [timelineWidth, setTimelineWidth] = useState<number>(0)
  const [data, setData] = useState({
    scaleX: 1,
    positionX: 0,
    zoomTargetX: 0,
    zoomPointX: 0
  })

  // const [data, setData] = useState({
  //   scaleX: 1,
  //   w: 0,
  //   zoomTargetX: 0,
  //   zoomPointX: 0
  // })


  const fullDurationVideoSec = fullDurationVideo / 1000

  useEffect(() => {
    setInterval(() => {
      console.log(moment().format(API_DATE_FORMAT))
      setTimePosition(moment().format(API_DATE_FORMAT))
    }, 1000)

    if(timeLineRef && timeLineRef.current) {
      setTimelineWidth(timeLineRef.current.offsetWidth)
    }

    if(!svgRef || svgRef.current) return

  }, [])

  //handleWheelEvent в useCallback
  const handleWheelEvent = (ev: React.WheelEvent): void => {
    if(!timeLineRef || !timeLineRef.current) return
    if(!svgRef || !svgRef.current) return

    const { offsetLeft, offsetWidth } = timeLineRef.current

    const zoomPointX = Math.round(fullDurationVideoSec * ((ev.pageX - offsetLeft) / offsetWidth * 100) / 100)

    ev.preventDefault()

    const delta = Math.max(-1, Math.min(1, ev.deltaY))

    const zoomTargetX = (zoomPointX - data.positionX) / data.scaleX

    let scaleX = data.scaleX + (delta * zoomIntensity * data.scaleX)
    // Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale - ev.deltaY / 100))

    scaleX = Math.max(1, Math.min(MAX_SCALE, scaleX))

    let positionX = -zoomTargetX * scaleX + zoomPointX

    if(positionX > 0) positionX = 0

    if(positionX + fullDurationVideoSec * scaleX < fullDurationVideoSec) positionX = -fullDurationVideoSec * (scaleX - 1)

    setData({
      scaleX: parseFloat(scaleX.toFixed(3)),
      zoomPointX: zoomPointX,
      zoomTargetX: zoomTargetX,
      positionX: parseFloat(positionX.toFixed(2)),
    })
  }

  const xStartVisibleSegment = Math.round(Math.abs(data.positionX) / data.scaleX)
  const xEndVisibleSegment = Math.round(xStartVisibleSegment + (fullDurationVideoSec / data.scaleX))

  const startVisibleTime = moment(moment(startTime, API_DATE_FORMAT).valueOf() + (xStartVisibleSegment * 1000)).format(API_DATE_FORMAT)
  const endVisibleTime = moment(moment(startTime, API_DATE_FORMAT).valueOf() + (xEndVisibleSegment * 1000)).format(API_DATE_FORMAT)

  return (
    <div className="App">
      <div>xStartVisibleSegment {xStartVisibleSegment} sec</div>
      <div>xEndVisibleSegment {xEndVisibleSegment} sec</div>
      <div>Продолжительность сегмента {xEndVisibleSegment - xStartVisibleSegment} sec</div>
      <div>startVisibleTime {startVisibleTime}</div>
      <div>endVisibleTime {endVisibleTime}</div>
      <div>{startTime}</div>
      <div>{endTime}</div>
      <pre>
        {JSON.stringify(contextSegments, null, 2)}
      </pre>

      <div ref={timeLineRef} onWheel={handleWheelEvent}>
        <svg width={`${timelineWidth}`}
             ref={svgRef}
             height="26"
             viewBox={`0 0 ${fullDurationVideoSec} 26`}
             preserveAspectRatio="none"
             fill="#C2C2C2"
             xmlns="http://www.w3.org/2000/svg">
          <rect width={`${fullDurationVideoSec}`} x={0} height="26" fill="#34404A"/>
          <rect width={`${fullDurationVideoSec}`} x={0} height="16" fill="#C2C2C2"/>
          <g className={'slider'}>
            <rect
                width={`300`}
                height="16"
                x={0}
                fill="#EB5757"/>
              {/*<text*/}
              {/*    y={20}*/}
              {/*    width={500}*/}
              {/*    x={segmentDuration(timePosition, startTime) / 1000} style={{*/}
              {/*      fontSize: 12*/}
              {/*}}>{timePosition}</text>*/}
          </g>
          <g className={'contextSegments'}
             transform={`translate(${data.positionX}) scale(${data.scaleX}, 1)`}>
            {contextSegments.map(item => {
              const width = segmentDuration(item.end, item.start) / 1000
              const x = segmentDuration(item.start, startTime) / 1000

              return <rect
                  xlinkTitle={`${item.start} - ${item.end}`}
                  opacity="0.7"
                  y="0"
                  height="8"
                  fill="#0098BA"
                  x={x}
                  width={width}
              />
            })}
          </g>
          {/*transform={`translate(${data.positionX}) scale(${data.scaleX}, 1)`}*/}
          <g className={'videoSegments'}
             transform={`translate(${data.positionX}) scale(${data.scaleX}, 1)`}>
            {videoSegments.map(item => {
              const width = segmentDuration(item.end, item.start) / 1000
              const x = segmentDuration(item.start, startTime) / 1000

              return <rect
                  opacity="0.7"
                  y="0"
                  height="16"
                  fill="#768089"
                  x={x}
                  width={width}
              />
            })}
          </g>
          <g clipPath="url(#clip0)">
            <line x1="28.5" y1="18" x2="28.5" y2="28" stroke="#7E7E7E"/>
            <line x1="250.5" y1="18" x2="250.5" y2="28" stroke="#7E7E7E"/>
            <line x1="475.5" y1="18" x2="475.5" y2="28" stroke="#7E7E7E"/>
            <line x1="139.5" y1="18" x2="139.5" y2="28" stroke="#7E7E7E"/>
            <line x1="364.5" y1="18" x2="364.5" y2="28" stroke="#7E7E7E"/>
            <line x1="586.5" y1="18" x2="586.5" y2="28" stroke="#7E7E7E"/>
            <line x1="642.5" y1="18" x2="642.5" y2="28" stroke="#7E7E7E"/>
            <line x1="56.5" y1="18" x2="56.5" y2="23" stroke="#7E7E7E"/>
            <line x1="278.5" y1="18" x2="278.5" y2="23" stroke="#7E7E7E"/>
            <line x1="503.5" y1="18" x2="503.5" y2="23" stroke="#7E7E7E"/>
            <line x1="167.5" y1="18" x2="167.5" y2="23" stroke="#7E7E7E"/>
            <line x1="392.5" y1="18" x2="392.5" y2="23" stroke="#7E7E7E"/>
            <line x1="614.5" y1="18" x2="614.5" y2="23" stroke="#7E7E7E"/>
            <line x1="0.5" y1="18" x2="0.5" y2="23" stroke="#7E7E7E"/>
            <line x1="223.5" y1="18" x2="223.5" y2="23" stroke="#7E7E7E"/>
            <line x1="447.5" y1="18" x2="447.5" y2="23" stroke="#7E7E7E"/>
            <line x1="111.5" y1="18" x2="111.5" y2="23" stroke="#7E7E7E"/>
            <line x1="336.5" y1="18" x2="336.5" y2="23" stroke="#7E7E7E"/>
            <line x1="559.5" y1="18" x2="559.5" y2="23" stroke="#7E7E7E"/>
            <line x1="83.5" y1="18" x2="83.5" y2="28" stroke="#7E7E7E"/>
            <line x1="306.5" y1="18" x2="306.5" y2="28" stroke="#7E7E7E"/>
            <line x1="531.5" y1="18" x2="531.5" y2="28" stroke="#7E7E7E"/>
            <line x1="195.5" y1="18" x2="195.5" y2="28" stroke="#7E7E7E"/>
            <line x1="419.5" y1="18" x2="419.5" y2="28" stroke="#7E7E7E"/>
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width={`${timelineWidth}`} height="10" fill="white" transform="translate(0 18)"/>
            </clipPath>
          </defs>
        </svg>

      </div>
    </div>
  );
}

export default App;
