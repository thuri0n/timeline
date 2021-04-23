import React, { useEffect, useRef, useState, WheelEventHandler } from 'react'
import './App.module.scss';
import styles from './App.module.scss';
import moment from 'moment'
import SimpleCanvasExample from './canva'
import { SVG } from '@svgdotjs/svg.js'

const startDay = '20.04.2021'
const endDay = '21.04.2021'

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const timeLineRef = useRef<HTMLDivElement>(null)
  const timeLineContainerRef = useRef<HTMLDivElement>(null)
  const [slicingScaleX, setSlicingScaleX] = useState<number>(1.00)
  const [timePosition, setTimePosition] = useState<DateAPIString>('18.04.2021 01:15:02.000')
  const [leftRunnerPositionPercent, setLeftRunnerPositionPercent] = useState<number>(0)
  const [visibleDurationVideo, setVisibleDurationVideo] = useState<number>(fullDurationVideo)
  const [leftVisibleStartTimeline, setLeftVisibleStartTimeline] = useState<DateAPIString>(startTime)
  const [rightVisibleEndTimeline, setRightVisibleEndTimeline] = useState<DateAPIString>(endTime)
  const [wheeling, setWheeling] = useState<any>(0)

  const [timelineWidth, setTimelineWidth] = useState<number>(0)
  const [data, setData] = useState({
    scaleX: 1,
    positionX: 0,
    zoomTargetX: 0,
    zoomPointX: 0
  })

  /**
   * 5m = 300000ms
   * 300000 / 172801001 * 100 = 0.01%
   *
   * 1315 / 1484 * 100 = 88.61%
   * слева 1315 = 88.61%, справа 169 = 11.38%
   *
   * 1000 100
   *
   * 172801001ms / 1484w = 116s
   *
   * 1618422505650 1618540057351
   *
   */
  // width = 1484
  // mouseX 143

  // translateX = 594
  // scaleX = 1.8

  const shape = (x: number, y: number, w: number, h: number, fill: string) => {
    return {
      x,
      y,
      w,
      h,
      fill
    }
  }

  useEffect(() => {
    if(timeLineRef && timeLineRef.current) setTimelineWidth(timeLineRef.current.offsetWidth)
    // // @ts-ignore
    // const ctx = canvasRef.current?.getContext('2d')
    // if(ctx) {
    //   ctx.fillStyle = '#34404A'
    //   ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    //
    //   const myRect = []
    //
    //   myRect.push(shape(10, 0, 25, 25, "#333"))
    //   myRect.push(shape(0, 40, 39, 25, "#333"))
    //   myRect.push(shape(0, 80, 100, 25, "#333"))
    //
    //   for (let i in myRect) {
    //     const oRec = myRect[i]
    //     ctx.beginPath()
    //     ctx.fillStyle = oRec.fill
    //     ctx.fillRect(oRec.x, oRec.y, oRec.w, oRec.h)
    //   }
    // }

    // setInterval(() => {
    //   setTimePosition(moment().format(API_DATE_FORMAT))
    // }, 1000)
  }, [])

  useEffect(() => {
    // добавление положения бегунка
    setLeftRunnerPositionPercent((((segmentDuration(timePosition, startTime) / fullDurationVideo) * 100)))
  }, [timePosition, visibleDurationVideo, leftVisibleStartTimeline, rightVisibleEndTimeline])

  useEffect(() => {
    // 2 это скорее всего соотношения по стороне x
    const shift = ((fullDurationVideo - visibleDurationVideo) / 2)

    setLeftVisibleStartTimeline(moment(moment(startTime, API_DATE_FORMAT).valueOf() + shift).format(API_DATE_FORMAT))
    setRightVisibleEndTimeline(moment(moment(endTime, API_DATE_FORMAT).valueOf() - shift).format(API_DATE_FORMAT))
  }, [visibleDurationVideo])

  //handleWheelEvent в useCallback
  const handleWheelEvent = (ev: React.WheelEvent): void => {
    if(!timeLineRef || !timeLineRef.current) return
    // if(!timeLineContainerRef || !timeLineContainerRef.current) return
    if(!svgRef || !svgRef.current) return

    const zoomPointX = ev.pageX - timeLineRef.current.offsetLeft

    ev.preventDefault()

    const delta = Math.max(-1, Math.min(1, ev.deltaY))

    const zoomTargetX = (zoomPointX - data.positionX) / data.scaleX

    let scaleX = data.scaleX + (delta * zoomIntensity * data.scaleX)

    scaleX = Math.max(1, Math.min(MAX_SCALE, scaleX))

    let positionX = -zoomTargetX * scaleX + zoomPointX

    if(positionX > 0) positionX = 0
    if(positionX + timelineWidth * scaleX < timelineWidth) positionX = -timelineWidth * (scaleX - 1)
    console.table({
      scaleX: parseFloat(scaleX.toFixed(3)),
      zoomPointX: zoomPointX,
      zoomTargetX: zoomTargetX,
      positionX: parseFloat(positionX.toFixed(2)),
    })
    setData({
      scaleX: parseFloat(scaleX.toFixed(3)),
      zoomPointX: zoomPointX,
      zoomTargetX: zoomTargetX,
      positionX: parseFloat(positionX.toFixed(2)),
    })

    setSlicingScaleX(scaleX)

    // const { offsetLeft } = timeLineRef.current
    //
    // setMouseX(ev.clientX - offsetLeft)
    //
    // const newScaleX = ev.deltaY > 0 ? scaleX + zoomIntensity : scaleX - zoomIntensity
    //
    // const newZoomPoint = ev.pageX - timeLineContainerRef.current.offsetLeft
    // const newZoomTarget = (newZoomPoint - pos) / scaleX
    //
    // const newPos = -newZoomTarget * newScaleX + newZoomPoint
    //
    // if(newPos > 0) setPos(0)
    // if(newPos + timelineWidth * newScaleX < timelineWidth) setPos(-timelineWidth * (newScaleX - 1))
    // setZoomPoint(newZoomPoint)
    // setZoomTarget(newZoomTarget)
    //
    // if(newScaleX > MAX_SCALE || newScaleX < MIN_SCALE) return
    // // setZoomTarget((mouseX - pos) / scaleX)
    //
    // setTranslateX(translateX)
    // setScaleX(newScaleX)
    // пропорциональное смещение по половине
    // setVisibleDurationVideo(Math.round(fullDurationVideo / newScaleX))

    clearTimeout(wheeling)

    setWheeling(setTimeout(() => {
      setWheeling(undefined)
      setSlicingScaleX(1.00)
    }, 300))
  }
  /**
   * сегмент = 172801001
   * начало сегмента = 1618394881000
   * конец сегмента = 1618567682001
   * масштаб = 1.2
   * видимый сегмент timeline = 172801001 / 1.2 = 144000834  //144000834.1666667.toFixed(0)
   * левый сдвиг (172801001 - 144000834) / 2
   *
   * разбираем скалирование относительно мышки и родительской ширины
   * позиция мышки при скроле 1178, вся ширина контейнера 1484
   * левое плечо 1178 / 1484 * 100 = 79.38%, правое 20.62%
   * деление по обе стороны 742
   */

  // const leftWidth = timelineWidth - (mouseX - 1)
  // const rightWidth = timelineWidth - (leftWidth - 2)

  useEffect(() => {

  }, [])

  const xStartVisibleSegment = Math.abs(data.positionX)
  const xEndVisibleSegment = timelineWidth * data.scaleX - (xStartVisibleSegment + timelineWidth)

  // сколько в масштабе стоит 1 пиксель в полной продолжительности видео
  const pixelToTimeRatio = Math.ceil(fullDurationVideo / (timelineWidth * data.scaleX))

  const visibleStart = moment(moment(startTime, API_DATE_FORMAT).valueOf() + Math.ceil(xStartVisibleSegment * pixelToTimeRatio)).format(API_DATE_FORMAT)
  const visibleEnd = moment(moment(endTime, API_DATE_FORMAT).valueOf() - Math.ceil(xEndVisibleSegment * pixelToTimeRatio)).format(API_DATE_FORMAT)
  console.log('endTime', moment(endTime, API_DATE_FORMAT).valueOf())
  console.log('pixelToTimeRatio', Math.ceil(xEndVisibleSegment * pixelToTimeRatio))
  return (
    <div className="App">
      <div>
        {/*слево = {leftWidth}px*/}
      </div>
      <div>
        {/*справо = {rightWidth}px*/}
      </div>
      {moment(startTime, API_DATE_FORMAT).valueOf()}
      <br/>
      {moment(endTime, API_DATE_FORMAT).valueOf()}
      <br/>
      {/*{moment(parseFloat((fullDurationVideo / scaleX / 2).toFixed(0))).valueOf()}*/}
      <div>{startTime}</div>
      <div>{endTime}</div>
      <div>Полная продолжительность видео = {fullDurationVideo}ms</div>
      <div>
        Видимая продолжительность видео = {visibleDurationVideo}ms
        <br />
        {/*начало { moment(, API_DATE_FORMAT) }*/}
        {/*конец {moment((fullDurationVideo - visibleDurationVideo) / 2).format(API_DATE_FORMAT)}*/}
      </div>
      <div>Текущая позиция бегунка {timePosition}</div>
      <div>width {timelineWidth}px</div>
      <pre>
        {JSON.stringify(contextSegments, null, 2)}
      </pre>
      {/*<div>Видимая ширина = {(((timelineWidth * data.scaleX) - data.positionX) / data.scaleX) - timelineWidth  }</div>*/}

      <div>
        <div>
          Начало {visibleStart}
        </div>
        <div>
          Конец {visibleEnd}
        </div>
        <div ref={timeLineRef} onWheel={handleWheelEvent}>
          <svg width={`${timelineWidth}`}
               ref={svgRef}
               height="26"
               viewBox={`0 0 ${timelineWidth} 26`}
               fill="#C2C2C2"
               xmlns="http://www.w3.org/2000/svg">
            <rect width={`${timelineWidth}`} height="26" fill="#34404A"/>
            <rect width={`${timelineWidth}`} height="16" fill="#C2C2C2"/>
            <g className={'slider'}>
              <rect width={`3`} height="16" x={150} fill="#EB5757"/>
            </g>
            <g className={'contextSegments'}
               transform={`translate(${data.positionX}) scale(${data.scaleX}, 1)`}>
              {contextSegments.map(item => {
                const widthSegment = timelineWidth * ((segmentDuration(item.end, item.start) / fullDurationVideo) * 100) / 100
                const leftOffset = timelineWidth * ((segmentDuration(item.start, startTime) / fullDurationVideo) * 100) / 100
                // сегменты с контекстами
                return <rect
                    opacity="0.7"
                    y="0"
                    height="8"
                    fill="#0098BA"
                    x={leftOffset}
                    width={widthSegment}
                />
              })}
            </g>
            <g className={'videoSegments'}
               transform={`translate(${data.positionX}) scale(${data.scaleX}, 1)`}>
              {videoSegments.map(item => {
                const widthSegment = timelineWidth * ((segmentDuration(item.end, item.start) / fullDurationVideo) * 100) / 100
                const leftOffset = timelineWidth * ((segmentDuration(item.start, startTime) / fullDurationVideo) * 100) / 100
                // сегменты с пропуском видео

                return <rect
                    opacity="0.7"
                    y="0"
                    height="16"
                    fill="#768089"
                    x={leftOffset}
                    width={widthSegment}
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
    </div>
  );
}

export default App;
