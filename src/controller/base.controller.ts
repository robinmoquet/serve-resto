import { RouterContext } from 'koa-router';
import { Response } from '../models/response';
import RestoManager from '../services/RestoManager';

export default class BaseController {
    /**
     * @param  {RouterContext} context
     */
    testConnection(context: RouterContext) {
        console.log('test connection');
        context.body = 'connection success !';
    }
    /**
     * @param  {RouterContext} context
     */
    async getFiveBestResto(context: RouterContext) {
        const response = new Response('success');

        const restoManager = new RestoManager();
        response.body = await restoManager.getTopFive();

        context.type = 'application/json';
        context.body = JSON.stringify(response);
    }

}
