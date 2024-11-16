'use client'

import React from "react";
import { Sparkles, Rocket, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Thesis = () => {
	return (
		<div className="container mx-auto px-4 py-12 bg-background text-foreground">
           
			<section className="mb-12 text-center">
				<h1 className="text-5xl font-bold mb-6">ProessorAI <span className="text-muted-foreground">v0.1</span></h1>
				<h3 className="text-xl max-w-2xl mx-auto">
					a modern quiz generation software
				</h3>
			</section>

			{/* <section className="mb-16 grid md:grid-cols-2 gap-12">
				<div>
					<h2 className="text-3xl font-bold mb-4 flex items-center">
						<Sparkles className="mr-2" /> Our Vision
					</h2>
					<p className="text-lg">
						We envision a world where learning is not just a task, but a thrilling journey. By harnessing the power of AI and gamification, we&apos;re creating tools that transform dry content into engaging quizzes and interactive experiences.
					</p>
				</div>
				<div>
					<h2 className="text-3xl font-bold mb-4 flex items-center">
						<Rocket className="mr-2" /> Our Approach
					</h2>
					<p className="text-lg">
						We blend advanced algorithms with user-centric design to craft quizzes that adapt to individual learning styles. Our platform doesn&apos;t just test knowledge—it cultivates understanding and retention through fun, interactive challenges.
					</p>
				</div>
			</section> */}

			<h2 className="text-3xl font-bold mb-4 flex items-center">
                <Sparkles className="mr-2" /> on assessment based learning
            </h2>
            <p className="text-lg">
                Quizzes, and specifically 4-choice quizzes, remain a dominant form of assessment in education. The 4-choice quiz accounts for x% of all quizzes and standardized tests. The form factor is simple, byte sized, easy to administer and score. We use assesments throughtout our life, from school (quizzes, standardised tests), to work (compliance and technical), to daily life (drivers licence, immigration). ProessorAI was born out of the creator&apos;s despair the 150 page New York Driver&apos;s License test.
            </p>

			<br /><br />
			<h2 className="text-3xl font-bold mb-4 flex items-center">
                <Sparkles className="mr-2" /> using AI to generate quizzes
            </h2>
            <p className="text-lg">
                Quiz Gen is hard when you a lot of content. It is hard to feed a large book, when the input token size of LLMs is only about 100K words. We solve this with AI workflows that can reliably generate quizzes from all rProessorAIt parts of a large corpus. We break down quizgen with 3 sequential tasks that we reliably tackle using reliable structured generation.
            </p>

			<br /><br />
			<h2 className="text-3xl font-bold mb-4 flex items-center">
                <Sparkles className="mr-2" /> ProessorAI&apos;s offerings
            </h2>
            <p className="text-lg">
               We offer 4 things:
			   <ul>
				   <li>Quiz Generation</li>
				   <li>Quiz Generation</li>
				   <li>Quiz Generation</li>
				   <li>Quiz Generation</li>
			   </ul>
            </p>

			<br /><br />
			<h2 className="text-3xl font-bold mb-4 flex items-center">
                <Sparkles className="mr-2" /> ProessorAI&apos;s goals
            </h2>
            <p className="text-lg">
                
            </p>

		</div>
	);
};

export default Thesis;
