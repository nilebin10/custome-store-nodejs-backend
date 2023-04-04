import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { STATUS_CODE, winstonLogger } from 'shared-services';
import { Buffer } from 'buffer';

export async function basicAuthorizer(event: APIGatewayTokenAuthorizerEvent){
    try{
        const { authorizationToken: token } = event;
        const principlalId = process.env.username || '';
        winstonLogger.logRequest(`Raw Token:: ${token}`);

        if(!token) {
            const policy = generatePolicy(principlalId, "Deny", event.methodArn, {
              message: 'Please send Basic Authorzation token', status_code: STATUS_CODE.BAD_REQUEST }); 
            return policy
        }

        let decodedToken = token.split(' ').pop() || '';
        
        decodedToken = await Buffer.from(decodedToken, 'base64').toString();

        winstonLogger.logRequest(`Received Token:: ${decodedToken}`);

        const [ secretUserName, secretPassword ] = decodedToken.split(':')
        const isCorrectUser = process.env.username === secretUserName;
        const isCorrectPassword = process.env.password === secretPassword;

        if(!(isCorrectPassword && isCorrectUser)) {
            const policy = generatePolicy(principlalId, "Deny", event.methodArn, {
              message: 'Please send correct Authorzation token', status_code: STATUS_CODE.UNAUTHORIZED }); 
            winstonLogger.logRequest(`Policy Deny:: ${JSON.stringify(policy)}`);
            return policy;
        }

        const policy =  generatePolicy(principlalId, "Allow", event.methodArn, {
          message: 'Invoke lambda permission granted  ', status_code: STATUS_CODE.SUCCESS });
          winstonLogger.logRequest(`Policy Allow:: ${JSON.stringify(policy)}`);
          return policy;

    }catch(err:any){
      return generatePolicy('error-123', "Deny", event.methodArn, {
        message: 'Please send Basic Authorzation token', status_code: STATUS_CODE.BAD_REQUEST }); 
    }
}

function generatePolicy(principalId: string, effect: string, resource: string, context?: any): APIGatewayAuthorizerResult {
  let authResponse = {} as any;
  
  authResponse.principalId = principalId;
  if (effect && resource) {
      let policyDocument = {} as any;
      policyDocument.Version = '2012-10-17'; 
      policyDocument.Statement = [];
      let statementOne = {} as any;
      statementOne.Action = 'execute-api:Invoke'; 
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
  }
  
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    "status_code": context.status_code,
    "message": context.message
  };
  return authResponse;
}