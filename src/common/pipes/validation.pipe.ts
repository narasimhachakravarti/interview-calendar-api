import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { validate } from 'class-validator';
  import { plainToInstance } from 'class-transformer';
  
  @Injectable()
  export class ValidationPipe implements PipeTransform<any> {
    private readonly logger = new Logger(ValidationPipe.name);
    
    async transform(value: any, { metatype }: ArgumentMetadata) {
      if (!metatype || !this.toValidate(metatype)) {
        return value;
      }
      
      const object = plainToInstance(metatype, value);
      const errors = await validate(object);
      
      if (errors.length > 0) {
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        
        this.logger.error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
        
        throw new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      
      return object;
    }
  
    private toValidate(metatype: Function): boolean {
      const types: Function[] = [String, Boolean, Number, Array, Object];
      return !types.includes(metatype);
    }
  }