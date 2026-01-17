import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Location must be at least 3 characters long' })
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
  location: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Category must be at least 2 characters long' })
  @MaxLength(50, { message: 'Category must not exceed 50 characters' })
  category: string;

  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsOptional()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsOptional()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;
}
