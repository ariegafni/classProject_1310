import express from 'express';
import dotenv from 'dotenv';
import connectDB from './servicece/db';
import authRoutes from './userRoutes/authRoutes';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Employees Project',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:3000'
            },
        ]
    },
    apis: ['./src/routes/*.ts'],
};

const openapiSpecification = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

connectDB();

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});