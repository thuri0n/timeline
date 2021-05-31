import React, { useRef, useEffect } from 'react';
import moment from 'moment'
import { Layer, Stage, Rect, Text } from 'react-konva'
import Konva from 'konva'

const startDay = '20.04.2021'
const endDay = '21.04.2021'

const startTime = `${startDay} 13:08:01:000`
const endTime = `${endDay} 13:08:02:001`

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
        start: `${startDay} 14:16:01.000`,
        end: `${startDay} 14:18:02.000`
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


const SimpleCanvasExample: React.FC<{}> = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRefCtx = useRef<CanvasRenderingContext2D | null>(null)
    const segments = 24
    const layerRef = React.useRef<Konva.Layer>(null)
    const stageRef = React.useRef<Konva.Stage>(null)

    useEffect(() => {
        if(!layerRef || !layerRef.current) return
        if(!stageRef || !stageRef.current) return

        layerRef.current.scale({ x: 1, y: 1 });
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
        // if(posX + width * newScale < width) {
        //     posX = -width * (newScale - 1)
        // }

        let newPos = {
            x: posX,
            y: 0,
        };

        console.table({
            pointerX: pointer?.x,
            mousePointToX: mousePointTo.x,
            newScale: newScale,
            posX: posX,
            width: width
        })

        layerRef.current.position(newPos);
    }

    const width = window.innerWidth
    const width24h = 86400000 // 24 часа в милисекундах

    //     <Rect
    // x={0}
    // y={0}
    // width={window.innerWidth}
    // height={height}
    // fill={'#34404A'}
    // />
    // {new Array(24).fill('').map((item, index) => {
    //     const positionX = window.innerWidth / segments * index
    //     const isOdd = index % 2 !== 0
    //     const heightLine = isOdd ? height - 10 : height / 2
    //
    //     return (
    //         <Rect
    //             x={positionX}
    //             y={0}
    //             width={1}
    //             height={heightLine}
    //             fill={'#7E7E7E'}
    //         />
    //     )
    // })}

    const getPointRelativeToWidth = (point: number) => {
        return width * (point / width24h * 100) / 100
    }

    return (
        <Stage width={width} height={height} ref={stageRef}>
            <Layer ref={layerRef} onWheel={handleWheel}>
                <Rect x={0} y={0} width={width} height={8} fill={'#C2C2C2'} />
                <Rect x={0} y={8} width={width} height={8} fill={'#768089'} />
                <Rect x={0} y={16} width={width} height={10} fill={'#34404A'} />

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
            </Layer>
        </Stage>
    )
};

export default SimpleCanvasExample;
