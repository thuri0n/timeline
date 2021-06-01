import React, { useRef, useEffect } from 'react';
import moment from 'moment'
import { Layer, Stage, Rect, Text } from 'react-konva'
import Konva from 'konva'

const startDay = '20.04.2021'
const endDay = '21.04.2021'

const startTime = `${startDay} 13:08:01:000`
const endTime = `${endDay} 13:08:01:000`

// где присутсвует видео
const videoSegments = [
    {
        start: `${startDay} 18:30:01.000`,
        end: `${startDay} 19:01:02.000`
    },
    {
        start: `${startDay} 23:00:01.000`,
        end: `${endDay} 03:15:02.000`
    }
]

const contextSegments = [
    {
        start: `${startDay} 14:00:01.000`,
        end: `${startDay} 14:15:02.000`
    },
    {
        start: `${startDay} 14:15:00.000`,
        end: `${startDay} 14:19:30.000`
    },
    {
        start: `${startDay} 18:00:01.000`,
        end: `${startDay} 19:15:02.000`
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

const zoomIntensity = 0.1
const MAX_SCALE = 24 * 12 // макс зум 5 мин; 12 - кол - во 5 минут в часах
// const MIN_SCALE = 1.0

// user story: При отображении таймлайна используются дискретные значения: 5, 10 и 20 минут, 2, 4, 8, 12 и 24 часа.
// ассоциация времени в ms к scaleX
const durationZoomLevel = {
    300000: 288,
    600000: 144,
    1200000: 72,
    7200000: 12,
    14400000: 6,
    28800000: 3,
    57600000: 1.5,
    86400000: 1,
}

let scaleBy = 1.1;
const height = 26

const getPositionSegment = (data: {
    positionMs: number,
    startMs: number
    endMs: number
    durationMs: number,
    width: number,
}): {
    scaleX: number,
    positionX: number,
} => {
    // durationMs: 300000
    // endMs: 1618999681000
    // positionMs: 1618963922000
    // startMs: 1618913281000
    // width: 1327

    const scaleX = data.durationMs / data.width // 226.07385079125848

    const fullDurationInMs = data.endMs - data.startMs // 86400000
    const offsetMs = data.startMs - data.positionMs // -50641000
    const pixelToMillisecondRatio = Math.floor(fullDurationInMs / (data.width * scaleX)) // 288 ms in 1 px (scaled!)
    const positionX = (offsetMs / pixelToMillisecondRatio) / pixelToMillisecondRatio // 175836.80555555556
    // ~ -3480.6242669554013

    console.log(data)
    console.log('scaleX', scaleX)
    console.log('fullDurationInMs', fullDurationInMs)
    console.log('pixelToMillisecondRatio', pixelToMillisecondRatio)
    console.log('startOffsetMs', offsetMs)
    console.log('positionX', positionX)

    return  {
        scaleX,
        positionX
    }
}


const SimpleCanvasExample: React.FC<{}> = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRefCtx = useRef<CanvasRenderingContext2D | null>(null)
    const segments = 24
    const layerRef = React.useRef<Konva.Layer>(null)
    const stageRef = React.useRef<Konva.Stage>(null)

    useEffect(() => {
        if(!layerRef || !layerRef.current) return
        if(!stageRef || !stageRef.current) return
        console.log('pos =>', moment('20.04.2021 14:14:30.000', API_DATE_FORMAT).valueOf())
        console.log('start =>', moment(startTime, API_DATE_FORMAT).valueOf())
        console.log('end =>', moment(endTime, API_DATE_FORMAT).valueOf())
        console.log(width)
        const test = getPositionSegment({
            positionMs: moment('21.04.2021 03:12:02.000', API_DATE_FORMAT).valueOf(),
            startMs: moment(startTime, API_DATE_FORMAT).valueOf(),
            endMs: moment(endTime, API_DATE_FORMAT).valueOf(),
            durationMs: 300000,
            width
        })
        console.log(test)

        layerRef.current.scaleX(test.scaleX);
        layerRef.current.position({ x: -test.positionX, y: 0 });
    }, [])


    const handleWheel = (ev: Konva.KonvaEventObject<WheelEvent>) => {
        ev.evt.preventDefault();
        
        if(!layerRef || !layerRef.current) return
        if(!stageRef || !stageRef.current) return

        let oldScale = layerRef.current.scaleX();

        let pointer = stageRef.current.getPointerPosition();

        let mousePointTo = {
            // @ts-ignore
            x: (pointer.x - layerRef.current.x()) / oldScale,
            // @ts-ignore
            y: (pointer.y - layerRef.current.y()) / oldScale,
        };

        let newScale =
            ev.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        if(newScale < 1) return

        layerRef.current.scale({ x: newScale, y: 1 });

        // @ts-ignore
        let posX = pointer.x - mousePointTo.x * newScale

        // if(posX < 0) posX = 0
        //
        if(posX + width * newScale < width) {
            posX = -width * (newScale - 1)
        }

        let newPos = {
            x: posX,
            y: 0,
        };

        // console.table({
        //     pointerX: pointer?.x,
        //     mousePointToX: mousePointTo.x,
        //     newScale: newScale,
        //     posX: posX,
        //     width: width
        // })
        console.log('posx =>', posX)

        layerRef.current.position(newPos);
    }

    const width = window.innerWidth
    const width24h = 86400000 // 24 часа в милисекундах
    const secInPixel = (width24h / 1000) / width

    const getPointRelativeToWidth = (point: number) => {
        return width * (point / width24h * 100) / 100
    }

    const segmentsEveryHalfMinute = 24 * 60 * 2

    return (
        <>
            <div>
                start = {startTime}
                <br/>
                end = {endTime}
                <br/>
                width = {width}
            </div>
            <Stage width={width} height={height} ref={stageRef}>
                <Layer ref={layerRef} onWheel={handleWheel}>
                    <Rect x={0} y={0} width={width} height={8} fill={'#C2C2C2'} />
                    <Rect x={0} y={8} width={width} height={8} fill={'#768089'} />

                    {contextSegments.map((item, index) => {
                        const widthRect = getPointRelativeToWidth(segmentDuration(item.end, item.start))
                        const xPos = getPointRelativeToWidth(segmentDuration(item.start, startTime))

                        return (
                            <Rect
                                key={index}
                                x={xPos}
                                y={0}
                                width={widthRect}
                                height={8}
                                fill={'#0098BA'}
                            />
                        )
                    })}

                    {videoSegments.map((item, index) => {
                        const widthRect = getPointRelativeToWidth(segmentDuration(item.end, item.start))
                        const xPos = getPointRelativeToWidth(segmentDuration(item.start, startTime))

                        return (
                            <Rect
                                key={index}
                                x={xPos}
                                y={8}
                                width={widthRect}
                                height={8}
                                fill={'#c2c2c2'}
                            />
                        )
                    })}

                    <Rect x={0} y={16} width={width} height={10} fill={'#34404A'} />

                    {new Array(segmentsEveryHalfMinute).fill('').map((item, index) => {
                        const isEven = (index + 1) % 2 === 0

                        return (
                            <Rect
                                scale={{ x: 1, y: 1}}
                                key={index}
                                x={segmentsEveryHalfMinute / width * index}
                                y={16}
                                width={1}
                                height={isEven ? 5 : 10}
                                fill={'#7E7E7E'}
                            />
                        )
                    })}
                </Layer>
            </Stage>
        </>
    )
};

export default SimpleCanvasExample;
