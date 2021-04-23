import React, { useRef, useEffect } from 'react';
import moment from 'moment'

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

const zoomIntensity = 0.01;
const MAX_SCALE = 24 * 12; // макс зум 5 мин; 12 - кол - во 5 минут в часах
const MIN_SCALE = 1.00


const SimpleCanvasExample: React.FC<{}> = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRefCtx = useRef<CanvasRenderingContext2D | null>(null)

    useEffect(() => {
        // Initialize
        if(!canvasRef.current) return
        const canvas: HTMLCanvasElement = canvasRef.current
        const ctx = canvas.getContext('2d')

        if(!ctx) return

        canvasRefCtx.current = ctx

        const width = ctx.canvas.width
        const height = ctx.canvas.height

        // ctx.fillRect(25,25,100,100);
        // ctx.fill();
        // ctx.clearRect(45,45,60,60);
        // ctx.strokeRect(50,50,50,50);
        // ctx.fillRect(15,55,25,25);
        // ctx.fillStyle = '#ff0000'
        ctx.beginPath();
        ctx.rect(0,0, 86401001 / 1000, height); // ctx.canvas.height
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.fillStyle = 'blue'
        ctx.fillRect(0, 0, 10.232, height);
        ctx.fillStyle = 'red'
        ctx.fillRect(112, 0, 10.232, height);
        ctx.stroke()

        setTimeout(() => {
            ctx.translate(100, 0)
            ctx.scale(1.6, 1)
            ctx.translate(-100, 0)
        })

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


    return <canvas ref={canvasRef} width={1920}  height={50}/>
};

export default SimpleCanvasExample;
