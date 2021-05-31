import React, { useRef, useEffect } from 'react';
import moment from 'moment'
import { Layer, Stage, Rect, Text } from 'react-konva'
import Konva from 'konva'

const startDay = '20.04.2021'
const endDay = '21.04.2021'

const startTime = `${startDay} 13:08:01:000`
const endTime = `${endDay} 13:08:02:001`

const videoSegments = [
    {
        start: `${startDay} 18:00:01.000`,
        end: `${startDay} 19:15:02.000`
    },
    {
        start: `${endDay} 00:00:01.000`,
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

let scaleBy = 1.01;


const SimpleCanvasExample: React.FC<{}> = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRefCtx = useRef<CanvasRenderingContext2D | null>(null)
    const segments = 24
    const layerRef = React.useRef<Konva.Layer>(null)
    const stageRef = React.useRef<Konva.Stage>(null)

    useEffect(() => {
        // Initialize
        if(!canvasRef.current) return
        const canvas: HTMLCanvasElement = canvasRef.current
        const ctx = canvas.getContext('2d')

        if(!ctx) return

        canvasRefCtx.current = ctx

        const width = ctx.canvas.width
        const height = ctx.canvas.height

        ctx.beginPath();
        ctx.rect(0,0, width, height); // ctx.canvas.height
        ctx.fillStyle = "#34404A";
        ctx.fill();

        for(let i = 0; i <= 24; i++) {
            ctx.fillStyle = 'red'
            const positionX = width / segments * i
            const isOdd = i % 2 !== 0
            const heightLine = isOdd ? height : height - 5
            ctx.fillRect(positionX, 0, 2, heightLine);
        }

        canvas.addEventListener('wheel', (ev) => {
            console.log(ev)
            const zoom = ev.deltaY < 0 ? 1.1 : 0.9;
            // ctx.translate()
            // const delta = ev.
            // ctx.translate(pt.x,pt.y);
            // ctx.scale(factor,factor);
            // ctx.translate(-pt.x,-pt.y);
            ev.preventDefault()

        }, { passive: true })
    }, []);

    const handleWheel = (ev: Konva.KonvaEventObject<WheelEvent>) => {
        ev.evt.preventDefault();
        
        if(!layerRef || !layerRef.current) return
        if(!stageRef || !stageRef.current) return

        console.log(layerRef.current.scaleX())

        var oldScale = layerRef.current.scaleX();

        var pointer = stageRef.current.getPointerPosition();

        var mousePointTo = {
            // @ts-ignore
            x: (pointer.x - layerRef.current.x()) / oldScale,
            // @ts-ignore
            y: (pointer.y - layerRef.current.y()) / oldScale,
        };

        var newScale =
            ev.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        layerRef.current.scale({ x: newScale, y: 1 });

        var newPos = {
            // @ts-ignore
            x: pointer.x - mousePointTo.x * newScale,
            // @ts-ignore
            y: pointer.y - mousePointTo.y * newScale,
        };
        layerRef.current.position(newPos);
    }


    return (
        <Stage width={window.innerWidth} height={10} ref={stageRef}>
            <Layer ref={layerRef} onWheel={handleWheel}>
                <Rect
                    x={0}
                    y={0}
                    width={window.innerWidth}
                    height={10}
                    fill={'#34404A'}
                />
                {new Array(24).fill('').map((item, index) => {
                    const positionX = window.innerWidth / segments * index
                    const isOdd = index % 2 !== 0
                    const heightLine = isOdd ? 10 : 5

                    return (
                        <Rect
                            x={positionX}
                            y={0}
                            width={1}
                            height={heightLine}
                            fill={'#7E7E7E'}
                        />
                    )
                })}
            </Layer>
        </Stage>
    )
};

export default SimpleCanvasExample;
